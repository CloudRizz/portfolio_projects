#!/usr/bin/env node
import 'source-map-support/register' 
import * as cdk from 'aws-cdk-lib';
import { HealthcareMigrationStack } from '../lib/vpc-stack';
import { EC2Stack } from '../lib/ec2-stack';
import { RDSStack } from '../lib/rds-stack';


const app = new cdk.App();
const vpcStack = new HealthcareMigrationStack(app, 'HealthcareMigrationStack', {
  
});

//// -- Create EC2 Stack --
new EC2Stack(app, 'MyEC2Stack', {
  vpc: vpcStack.vpc
})

//// -- Create RDS Stack --
new RDSStack(app, 'MyRDSStack', {
  vpc: vpcStack.vpc
});

app.synth()