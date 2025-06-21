#!/usr/bin/env node 
import * as cdk from 'aws-cdk-lib';
import { HealthcareMigrationStack } from '../lib/healthcare_migration_stack';


const app = new cdk.App();

new HealthcareMigrationStack(app, 'HealthcareMigrationStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-west-2',
  },
});
