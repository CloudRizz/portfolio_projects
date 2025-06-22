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
- Install Putty (https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)
- Create a premade ppk keypair (ec2-user)

## Project Initialization

#### Clone the repository

```
git clone <repository-url>
cd aws-migration-project
```
#### Install AWS CDK
```
## Install CDK
npm install -g aws-cdk

## Navigate to project directory
cd <folder name>

## Initialize CDK
npx aws-cdk@latest init app --language=typescript

```
#### AWS Configure
```
aws configure
```

## Code Development 

#### VPC
```
 // VPC with 2 AZs, 1 public and 1 private subnet per AZ

    const vpc = new ec2.Vpc(this, 'MigrationVPC', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24
        },
        {
          name: 'PrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24
        },
      ]
    });
```

#### Security Group
```
// Security Group for EC2 (Allows SSH & App Traffic)

    const ec2SecurityGroup = new ec2.SecurityGroup(this, 'EC2SecurityGroup', {
      vpc, 
      allowAllOutbound: true, 
      description: 'Security Group for EC2 Instance',
    });
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(22), 'Allow SSH');
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(80), 'Allow HTTP');

// Security Group for RDS (Allows traffic from EC2)

    const rdsSecurityGroup = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
      vpc,
      allowAllOutbound: true, 
      description: 'Security group for RDS instance',
    });
    rdsSecurityGroup.addIngressRule(ec2SecurityGroup, ec2.Port.tcp(3306), 'Allow MySQL from EC2');

```

#### IAM Role
```
// IAM Role for EC2 Instance

    const ec2Role = new iam.Role(this, 'EC2IAMRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });
    ec2Role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
```

#### Instance Definition 
```
// Launch EC2 Instance in Public Subnet

    const ec2Instance = new ec2.Instance(this, 'MicgrationEC2', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup: ec2SecurityGroup,
      role: ec2Role,
      keyName: 'ec2-user',
    });
```
```
 // Create a RDS Instance in Private Subnet

    const rdsInstance = new rds.DatabaseInstance(this, 'MigrationRDS', {
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0}),
      vpc, 
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [rdsSecurityGroup],
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      allocatedStorage: 20,
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      removalPolicy: cdk.RemovalPolicy.DESTROY, // WARNING: Deletes DB on stack removal    
    });

    // Grant EC2 role access to the RDS Secret in secrets manager
    rdsInstance.secret?.grantRead(ec2Role);
```

#### Bootstrap your AWS environment (only needs to be done once)
```
cdk bootstrap
```

#### Deploy the stack
```
cdk deploy
```
#### Test Connections to EC2 Instance

1. Open Putty
2. Use Ipv4 from Instance and paste into Host Name
3. Navigate to SSH >> Auth >> Credentials
4. Attach ppk key to private key for authentication.
5. Click open enter user name ec2-user (this will establish ssh connection to EC2 instance.

#### Test Connections to RDS 

1. After ssh into the EC2 instance
2. Paste below into EC2 instance terminal (RDS endpoint is available from RDS database connectivity and security and the admin username was predefined by code)
```
mysql -h <rds-endpoint> -u admin -p
```
4. Once you enter this it will ask for a password which is obtainable from secrets manager.
5. Once entering the password you have now successfully entered the RDS database. 


#### Destroy the stack
Destroy the stack to ensure no ongoing charges
```
cdk destroy
```
Note: By default, the RDS instance uses RemovalPolicy.DESTROY, which means the database will be deleted when the stack is torn down. Update this policy if you want to preserve your data after stack deletion.

## Troubleshooting
- Ensure a keypair is created to ssh into the EC2 instance via Putty, to allow tunneling to test the connection to the RDS Database.
- Use BURSTABLE (t3) instances with MySQL as t2 instances aren't compatible.
- Verify that security groups allow the right traffic between EC2 and RDS.

## Security Considerations
- Database credentials are securely managed and stored in AWS Secrets Manager.
- The EC2 instance is assigned an IAM role to ensure secure access to necessary AWS services.
- Security groups are configured to permit only essential inbound and outbound traffic. (Testing confirms these are configured correctly)





