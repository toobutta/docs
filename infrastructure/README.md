# Evoteli Infrastructure

This directory contains Infrastructure-as-Code (IaC) for deploying Evoteli to AWS.

## Structure

```
infrastructure/
├── terraform/
│   ├── main.tf                 # Main configuration
│   ├── variables.tf            # Input variables
│   ├── outputs.tf              # Output values
│   ├── providers.tf            # Provider configuration
│   ├── modules/
│   │   ├── vpc/                # VPC and networking
│   │   ├── clickhouse/         # ClickHouse cluster
│   │   ├── rds/                # PostgreSQL/PostGIS
│   │   ├── eks/                # Kubernetes cluster
│   │   ├── kafka/              # MSK (Managed Kafka)
│   │   └── elasticache/        # Valkey/Redis cache
│   └── environments/
│       ├── dev/                # Development environment
│       ├── staging/            # Staging environment
│       └── production/         # Production environment
```

## Prerequisites

- Terraform >= 1.5.0
- AWS CLI configured with credentials
- AWS account with appropriate permissions

## Quick Start

```bash
# Initialize Terraform
cd infrastructure/terraform/environments/dev
terraform init

# Plan deployment
terraform plan

# Apply infrastructure
terraform apply

# Outputs
terraform output
```

## Environments

### Development
- Single-node ClickHouse
- db.t3.medium RDS PostgreSQL
- 2-node EKS cluster (t3.medium)
- MSK 3-broker cluster (kafka.t3.small)

### Staging
- 3-node ClickHouse cluster
- db.r5.large RDS PostgreSQL
- 3-node EKS cluster (t3.large)
- MSK 3-broker cluster (kafka.m5.large)

### Production
- 3-node ClickHouse cluster (HA)
- db.r5.2xlarge RDS PostgreSQL Multi-AZ
- 5-node EKS cluster (m5.2xlarge)
- MSK 6-broker cluster (kafka.m5.2xlarge)

## Cost Estimates

| Environment | Monthly Cost |
|-------------|--------------|
| Development | ~$850 |
| Staging | ~$2,500 |
| Production | ~$8,500 |

## Deployment

See [Deployment Guide](../deployment/infrastructure.mdx) for detailed instructions.
