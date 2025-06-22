# TechHealth Infrastructure Migration

This project leverages the AWS CDK with TypeScript to provision a secure cloud infrastructure for migrating applications. It sets up a VPC with public and private subnets spanning multiple availability zones, launches an EC2 instance, and deploys a MySQL RDS database.

## Current Architecture

![Project 2 - AWS migration - Current Architecture screenshot](https://github.com/user-attachments/assets/17003538-4405-487c-99bd-1addad91ba11)

## Revised Architecture

- VPC: 2 Availability Zones with public and private subnets
- EC2 Instance: Deployed in public subnets with a security group allowing ssh and HTTP access
- RDS Database: MySQL 8.0 deployed in private subnet
- Security Groups: COnfigured to allow neccessary traffic
- IAM Roles: Set up for EC2 Instance with appropriate permissions to allow access to RDS Database

![Project 2 - AWS migration - revised architecture screenshot](https://github.com/user-attachments/assets/a06461a4-900b-4256-a7d1-4a0545e74fec)

## Baseline Requirements

- AWS CLI installed and configured
- AWS CDK installed globally
- GitHub Repository

## Project Initialization

1. Clone the repository

```
git clone <repository-url>
cd aws-migration-project
```
2. Install AWS CDK
```
## Install CDK
npm install -g aws-cdk

## Navigate to project directory
cd <folder name>

## Initialize CDK
npx aws-cdk@latest init app --language=typescript

```
## Please ensure at this point the AWS CLI is installed and configured








4. Bootstrap your AWS environment (only needs to be done once)
5. Deploy the stack 

