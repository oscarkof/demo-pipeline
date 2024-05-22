import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { ApplicationPipelineStage } from './pipeline-app-stage';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const synthStep = new ShellStep('Synth', {
      input: CodePipelineSource.connection('oscarkof/demo-pipeline', 'main', {
        connectionArn: 'arn:aws:codestar-connections:us-east-1:702944629921:connection/42daae90-0ffc-4dce-9f91-308a9f2defa4', // Created using the AWS code pipeline console 
      }),
      commands: [
        'npm install -g aws-cdk',
        'npm install -D esbuild', 
        'pwd', 
        'cd infra', 
        'npm run prebuild', 
        'cdk synth'],
      primaryOutputDirectory: 'infra/cdk.out'
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'PipelineDemo',
      synth: synthStep
    });

    const deploy = new ApplicationPipelineStage(this, 'Deploy');
    const deployStage = pipeline.addStage(deploy);

    deployStage.addPost(new ShellStep('TestAPIGatewayEndpoint', {
      commands: ['curl -H "Content-Type: application/json" -X POST  $ENDPOINT_URL/scan -d "{\"id\":\"12345\"}"'],
      envFromCfnOutputs: {
        ENDPOINT_URL: deploy.apgwEndpointUrl
      }
    })
  )

  }
}
