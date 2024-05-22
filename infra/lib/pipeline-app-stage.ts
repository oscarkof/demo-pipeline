import { DemoInfraStack } from './application-stack';
import { Stage, StageProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ApplicationPipelineStage extends Stage {

    public readonly apgwEndpointUrl: CfnOutput;

    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);        

        const infraStack = new DemoInfraStack(this, 'ApiRest');
        this.apgwEndpointUrl = infraStack.apgwEndpointUrl;
    }
}