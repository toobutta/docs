"""
Email Service

SendGrid integration for sending property alert emails.
"""
from typing import List, Dict, Any, Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Personalization
from jinja2 import Template
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SendGrid"""

    def __init__(self):
        self.client = SendGridAPIClient(settings.SENDGRID_API_KEY)
        self.from_email = Email(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME)

    async def send_property_alert(
        self,
        to_email: str,
        search_name: str,
        properties: List[Dict[str, Any]],
        search_id: str,
        unsubscribe_token: Optional[str] = None
    ) -> tuple[bool, Optional[str], Optional[str]]:
        """
        Send property alert email

        Args:
            to_email: Recipient email address
            search_name: Name of the saved search
            properties: List of property data dictionaries
            search_id: UUID of the saved search
            unsubscribe_token: Token for unsubscribe link

        Returns:
            Tuple of (success, message_id, error_message)
        """
        try:
            # Generate email content
            html_content = self._generate_alert_html(search_name, properties, search_id, unsubscribe_token)
            plain_content = self._generate_alert_plain(search_name, properties)

            # Create email
            message = Mail(
                from_email=self.from_email,
                to_emails=To(to_email),
                subject=f"New Properties Match Your Search: {search_name}",
                plain_text_content=Content("text/plain", plain_content),
                html_content=Content("text/html", html_content)
            )

            # Add custom args for tracking
            message.custom_arg = {
                "search_id": search_id,
                "alert_type": "property_match"
            }

            # Add unsubscribe group
            if settings.SENDGRID_UNSUBSCRIBE_GROUP_ID:
                message.asm = {
                    "group_id": settings.SENDGRID_UNSUBSCRIBE_GROUP_ID
                }

            # Send email
            response = self.client.send(message)

            if response.status_code in [200, 202]:
                message_id = response.headers.get('X-Message-Id')
                logger.info(f"Alert email sent successfully to {to_email}, message_id: {message_id}")
                return True, message_id, None
            else:
                error_msg = f"SendGrid returned status {response.status_code}"
                logger.error(f"Failed to send alert email: {error_msg}")
                return False, None, error_msg

        except Exception as e:
            logger.error(f"Error sending alert email: {str(e)}")
            return False, None, str(e)

    def _generate_alert_html(
        self,
        search_name: str,
        properties: List[Dict[str, Any]],
        search_id: str,
        unsubscribe_token: Optional[str]
    ) -> str:
        """Generate HTML email content for property alert"""
        template = Template("""
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
        .property { border: 1px solid #ddd; margin: 15px 0; padding: 15px; border-radius: 5px; }
        .property-header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .property-details { color: #666; }
        .property-score { display: inline-block; background-color: #28a745; color: white; padding: 5px 10px; border-radius: 3px; margin: 5px 5px 5px 0; }
        .cta-button { display: inline-block; background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Properties Match Your Search</h1>
            <p>{{ search_name }}</p>
        </div>

        <p>We found {{ property_count }} new {{ 'property' if property_count == 1 else 'properties' }} matching your saved search criteria:</p>

        {% for property in properties %}
        <div class="property">
            <div class="property-header">{{ property.address }}</div>
            <div class="property-details">
                <p><strong>Type:</strong> {{ property.property_type }}</p>
                {% if property.roofiq %}
                <div class="property-score">RoofIQ Score: {{ property.roofiq.score }}/100</div>
                {% endif %}
                {% if property.solarfit %}
                <div class="property-score">Solar Score: {{ property.solarfit.solar_score }}/100</div>
                {% endif %}
                {% if property.drivewaypro %}
                <div class="property-score">Driveway Score: {{ property.drivewaypro.condition_score }}/100</div>
                {% endif %}
            </div>
            <a href="{{ base_url }}/property/{{ property.id }}" class="cta-button">View Details</a>
        </div>
        {% endfor %}

        <div style="text-align: center;">
            <a href="{{ base_url }}/searches/{{ search_id }}" class="cta-button">View All Results</a>
        </div>

        <div class="footer">
            <p>You're receiving this email because you created a saved search on {{ app_name }}.</p>
            {% if unsubscribe_token %}
            <p><a href="{{ base_url }}/unsubscribe/{{ unsubscribe_token }}">Unsubscribe</a> | <a href="{{ base_url }}/settings/email">Manage Email Preferences</a></p>
            {% endif %}
        </div>
    </div>
</body>
</html>
        """)

        return template.render(
            search_name=search_name,
            property_count=len(properties),
            properties=properties,
            search_id=search_id,
            unsubscribe_token=unsubscribe_token,
            base_url=settings.FRONTEND_URL,
            app_name=settings.PROJECT_NAME
        )

    def _generate_alert_plain(self, search_name: str, properties: List[Dict[str, Any]]) -> str:
        """Generate plain text email content for property alert"""
        lines = [
            f"New Properties Match Your Search: {search_name}",
            "",
            f"We found {len(properties)} new {'property' if len(properties) == 1 else 'properties'} matching your saved search:",
            ""
        ]

        for prop in properties:
            lines.append(f"- {prop['address']}")
            lines.append(f"  Type: {prop.get('property_type', 'N/A')}")
            if prop.get('roofiq'):
                lines.append(f"  RoofIQ Score: {prop['roofiq']['score']}/100")
            if prop.get('solarfit'):
                lines.append(f"  Solar Score: {prop['solarfit']['solar_score']}/100")
            lines.append(f"  View: {settings.FRONTEND_URL}/property/{prop['id']}")
            lines.append("")

        lines.extend([
            f"View all results: {settings.FRONTEND_URL}/searches",
            "",
            f"You're receiving this email because you created a saved search on {settings.PROJECT_NAME}.",
            f"Manage your email preferences: {settings.FRONTEND_URL}/settings/email"
        ])

        return "\n".join(lines)

    async def send_test_alert(self, to_email: str, search_name: str) -> tuple[bool, Optional[str], Optional[str]]:
        """Send a test alert email"""
        try:
            html_content = """
            <html>
            <body>
                <h2>Test Alert</h2>
                <p>This is a test alert for your saved search: <strong>{search_name}</strong></p>
                <p>When properties match your search criteria, you'll receive an email similar to this with property details.</p>
            </body>
            </html>
            """.format(search_name=search_name)

            message = Mail(
                from_email=self.from_email,
                to_emails=To(to_email),
                subject=f"Test Alert: {search_name}",
                html_content=Content("text/html", html_content)
            )

            response = self.client.send(message)

            if response.status_code in [200, 202]:
                message_id = response.headers.get('X-Message-Id')
                return True, message_id, None
            else:
                return False, None, f"SendGrid returned status {response.status_code}"

        except Exception as e:
            logger.error(f"Error sending test email: {str(e)}")
            return False, None, str(e)


# Singleton instance
email_service = EmailService()
