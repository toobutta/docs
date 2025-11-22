"""
Google Ads Service

Service for integrating with Google Ads API and Customer Match.
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import hashlib
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class GoogleAdsService:
    """Service for Google Ads API interactions"""

    def __init__(self):
        self.client_id = settings.GOOGLE_ADS_CLIENT_ID
        self.client_secret = settings.GOOGLE_ADS_CLIENT_SECRET
        self.developer_token = settings.GOOGLE_ADS_DEVELOPER_TOKEN

    def get_client(
        self,
        customer_id: str,
        access_token: str,
        refresh_token: str
    ) -> GoogleAdsClient:
        """
        Create Google Ads API client

        Args:
            customer_id: Google Ads customer ID
            access_token: OAuth access token
            refresh_token: OAuth refresh token

        Returns:
            Configured GoogleAdsClient
        """
        credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            client_id=self.client_id,
            client_secret=self.client_secret,
            token_uri="https://oauth2.googleapis.com/token"
        )

        config = {
            "developer_token": self.developer_token,
            "use_proto_plus": True,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token,
            "login_customer_id": customer_id,
        }

        return GoogleAdsClient.load_from_dict(config)

    async def refresh_access_token(
        self,
        refresh_token: str
    ) -> Tuple[str, datetime]:
        """
        Refresh OAuth access token

        Args:
            refresh_token: Refresh token

        Returns:
            Tuple of (new_access_token, expires_at)
        """
        try:
            credentials = Credentials(
                token=None,
                refresh_token=refresh_token,
                client_id=self.client_id,
                client_secret=self.client_secret,
                token_uri="https://oauth2.googleapis.com/token"
            )

            # Refresh the token
            credentials.refresh(Request())

            expires_at = datetime.utcnow() + timedelta(seconds=3600)  # Usually 1 hour

            return credentials.token, expires_at

        except Exception as e:
            logger.error(f"Failed to refresh access token: {str(e)}")
            raise

    async def get_account_info(
        self,
        customer_id: str,
        access_token: str,
        refresh_token: str
    ) -> Dict[str, Any]:
        """
        Get Google Ads account information

        Args:
            customer_id: Customer ID
            access_token: Access token
            refresh_token: Refresh token

        Returns:
            Dict with account info
        """
        try:
            client = self.get_client(customer_id, access_token, refresh_token)
            ga_service = client.get_service("GoogleAdsService")

            query = """
                SELECT
                    customer.id,
                    customer.descriptive_name,
                    customer.currency_code,
                    customer.time_zone
                FROM customer
                WHERE customer.id = '{customer_id}'
            """.format(customer_id=customer_id)

            response = ga_service.search(customer_id=customer_id, query=query)

            for row in response:
                return {
                    "customer_id": str(row.customer.id),
                    "account_name": row.customer.descriptive_name,
                    "currency_code": row.customer.currency_code,
                    "time_zone": row.customer.time_zone,
                }

            raise ValueError(f"Customer {customer_id} not found")

        except GoogleAdsException as ex:
            logger.error(f"Google Ads API error: {ex}")
            raise
        except Exception as e:
            logger.error(f"Error getting account info: {str(e)}")
            raise

    async def create_customer_match_user_list(
        self,
        customer_id: str,
        access_token: str,
        refresh_token: str,
        name: str,
        description: str = "",
        membership_lifespan_days: int = 10000
    ) -> Tuple[str, str]:
        """
        Create a Customer Match user list

        Args:
            customer_id: Google Ads customer ID
            access_token: OAuth access token
            refresh_token: OAuth refresh token
            name: User list name
            description: User list description
            membership_lifespan_days: How long users stay in list (max 10000)

        Returns:
            Tuple of (resource_name, user_list_id)
        """
        try:
            client = self.get_client(customer_id, access_token, refresh_token)
            user_list_service = client.get_service("UserListService")

            # Create user list operation
            user_list_operation = client.get_type("UserListOperation")
            user_list = user_list_operation.create

            user_list.name = name
            user_list.description = description
            user_list.membership_status = client.enums.UserListMembershipStatusEnum.OPEN
            user_list.membership_life_span = membership_lifespan_days

            # Set as Customer Match list
            user_list.crm_based_user_list.upload_key_type = (
                client.enums.CustomerMatchUploadKeyTypeEnum.CONTACT_INFO
            )

            # Create the user list
            response = user_list_service.mutate_user_lists(
                customer_id=customer_id,
                operations=[user_list_operation]
            )

            resource_name = response.results[0].resource_name
            user_list_id = resource_name.split("/")[-1]

            logger.info(f"Created user list: {resource_name}")

            return resource_name, user_list_id

        except GoogleAdsException as ex:
            logger.error(f"Failed to create user list: {ex}")
            for error in ex.failure.errors:
                logger.error(f"Error: {error.message}")
            raise
        except Exception as e:
            logger.error(f"Error creating user list: {str(e)}")
            raise

    def _hash_email(self, email: str) -> str:
        """Hash email for Customer Match (SHA256)"""
        return hashlib.sha256(email.lower().strip().encode()).hexdigest()

    def _hash_phone(self, phone: str) -> str:
        """Hash phone number for Customer Match (E.164 format, SHA256)"""
        # Remove all non-digit characters
        phone = ''.join(filter(str.isdigit, phone))
        # Add + prefix if not present
        if not phone.startswith('+'):
            phone = '+' + phone
        return hashlib.sha256(phone.encode()).hexdigest()

    async def upload_customer_match_data(
        self,
        customer_id: str,
        access_token: str,
        refresh_token: str,
        user_list_resource_name: str,
        contacts: List[Dict[str, str]]
    ) -> Dict[str, int]:
        """
        Upload contact data to Customer Match user list

        Args:
            customer_id: Google Ads customer ID
            access_token: OAuth access token
            refresh_token: OAuth refresh token
            user_list_resource_name: User list resource name
            contacts: List of contact dicts with 'email' and/or 'phone'

        Returns:
            Dict with upload statistics
        """
        try:
            client = self.get_client(customer_id, access_token, refresh_token)
            offline_user_data_job_service = client.get_service(
                "OfflineUserDataJobService"
            )

            # Create offline user data job
            job = client.get_type("OfflineUserDataJob")
            job.type_ = client.enums.OfflineUserDataJobTypeEnum.CUSTOMER_MATCH_USER_LIST
            job.customer_match_user_list_metadata.user_list = user_list_resource_name

            # Create the job
            response = offline_user_data_job_service.create_offline_user_data_job(
                customer_id=customer_id,
                job=job
            )

            job_resource_name = response.resource_name
            logger.info(f"Created offline user data job: {job_resource_name}")

            # Prepare operations (batch of contacts)
            operations = []
            for contact in contacts:
                operation = client.get_type("OfflineUserDataJobOperation")
                user_data = operation.create

                # Add user identifiers
                user_identifier_list = []

                if contact.get("email"):
                    email_identifier = client.get_type("UserIdentifier")
                    email_identifier.hashed_email = self._hash_email(contact["email"])
                    user_identifier_list.append(email_identifier)

                if contact.get("phone"):
                    phone_identifier = client.get_type("UserIdentifier")
                    phone_identifier.hashed_phone_number = self._hash_phone(
                        contact["phone"]
                    )
                    user_identifier_list.append(phone_identifier)

                # Add address data if provided
                if any(k in contact for k in ["first_name", "last_name", "country_code", "zip_code"]):
                    address_identifier = client.get_type("UserIdentifier")
                    address_info = address_identifier.address_info

                    if contact.get("first_name"):
                        address_info.hashed_first_name = hashlib.sha256(
                            contact["first_name"].lower().strip().encode()
                        ).hexdigest()

                    if contact.get("last_name"):
                        address_info.hashed_last_name = hashlib.sha256(
                            contact["last_name"].lower().strip().encode()
                        ).hexdigest()

                    if contact.get("country_code"):
                        address_info.country_code = contact["country_code"]

                    if contact.get("zip_code"):
                        address_info.postal_code = contact["zip_code"]

                    user_identifier_list.append(address_identifier)

                user_data.user_identifiers.extend(user_identifier_list)
                operations.append(operation)

            # Upload data in batches (API limit is 100k per request)
            batch_size = 10000
            total_uploaded = 0

            for i in range(0, len(operations), batch_size):
                batch = operations[i:i + batch_size]

                offline_user_data_job_service.add_offline_user_data_job_operations(
                    resource_name=job_resource_name,
                    operations=batch,
                    enable_partial_failure=True
                )

                total_uploaded += len(batch)
                logger.info(f"Uploaded batch {i // batch_size + 1}: {len(batch)} contacts")

            # Run the job
            offline_user_data_job_service.run_offline_user_data_job(
                resource_name=job_resource_name
            )

            logger.info(f"Started offline user data job: {job_resource_name}")

            return {
                "total_uploaded": total_uploaded,
                "job_resource_name": job_resource_name,
            }

        except GoogleAdsException as ex:
            logger.error(f"Failed to upload customer match data: {ex}")
            for error in ex.failure.errors:
                logger.error(f"Error: {error.message}")
            raise
        except Exception as e:
            logger.error(f"Error uploading data: {str(e)}")
            raise

    async def get_user_list_stats(
        self,
        customer_id: str,
        access_token: str,
        refresh_token: str,
        user_list_resource_name: str
    ) -> Dict[str, int]:
        """
        Get statistics for a user list

        Args:
            customer_id: Customer ID
            access_token: Access token
            refresh_token: Refresh token
            user_list_resource_name: User list resource name

        Returns:
            Dict with size_for_display and other stats
        """
        try:
            client = self.get_client(customer_id, access_token, refresh_token)
            ga_service = client.get_service("GoogleAdsService")

            query = f"""
                SELECT
                    user_list.id,
                    user_list.name,
                    user_list.size_for_display,
                    user_list.size_for_search,
                    user_list.match_rate_percentage
                FROM user_list
                WHERE user_list.resource_name = '{user_list_resource_name}'
            """

            response = ga_service.search(customer_id=customer_id, query=query)

            for row in response:
                return {
                    "size_for_display": row.user_list.size_for_display,
                    "size_for_search": row.user_list.size_for_search,
                    "match_rate_percentage": row.user_list.match_rate_percentage,
                }

            return {
                "size_for_display": 0,
                "size_for_search": 0,
                "match_rate_percentage": 0,
            }

        except Exception as e:
            logger.error(f"Error getting user list stats: {str(e)}")
            return {
                "size_for_display": 0,
                "size_for_search": 0,
                "match_rate_percentage": 0,
            }


# Singleton instance
google_ads_service = GoogleAdsService()
