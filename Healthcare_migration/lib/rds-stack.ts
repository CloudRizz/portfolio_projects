import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

// Props

interface RDSStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
}

export class RDSStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: RDSStackProps) {
        super(scope, id, props);

        /// RDS Instance 
        const dbInstance = new rds.DatabaseInstance(this, 'MyRDSInstance', { 
                    engine: rds.DatabaseInstanceEngine.mysql({
                        version: rds.MysqlEngineVersion.VER_8_0
                    }),
                    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
                    vpc: props.vpc, 
                    vpcSubnets: {
                        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                        availabilityZones: [props.vpc.availabilityZones[0]]
                    },
                    allocatedStorage: 20,
                    maxAllocatedStorage: 30, 
                    deletionProtection: false, 
                    credentials: rds.Credentials.fromGeneratedSecret('admin'),
                    databaseName: 'MyDatabase',
                    publiclyAccessible: false,
                    multiAz: false,
            })
        
        //// -- TAGS -- 
    cdk.Tags.of(dbInstance).add('Name', 'MyRDSInstance');



        //// RDS Instance in AZ 2 ??


        //// ------ Endpoint ------
    new cdk.CfnOutput(this, 'RDSInstanceEndpoint', {
        value: dbInstance.dbInstanceEndpointAddress,
        description: 'The endpoint of the RDS Instance',
        exportName: 'MyRdsEndpoint',
        });
          
    }
}
