import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { ApplicationPipelineStage } from './pipeline-app-stage';

export class InfraStack99 extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const synthStep = new ShellStep('Synth', {
      input: CodePipelineSource.connection('oscarkof/demo-pipeline', 'main', {
        connectionArn: 'arn:aws:codeconnections:us-east-1:851725412753:connection/d4fbc540-c60f-4300-87a5-cb513c03428f', // Created using the AWS code pipeline console 
      }),
      commands: [
        'npm install -g aws-cdk',
        //'npm install -D esbuild', 
        'pwd', 
        'cd infra', 
        'npm run prebuild', 
        'cdk synth'],
      primaryOutputDirectory: 'infra/cdk.out'
    });

    const pipeline = new CodePipeline(this, 'Pipeline-user12', {
      pipelineName: 'PipelineDemo-user12',
      synth: synthStep
    });

    const deploy = new ApplicationPipelineStage(this, 'Deploy');
    const deployStage = pipeline.addStage(deploy);

    deployStage.addPre(new ManualApprovalStep('PromoteToProd'));

    deployStage.addPost(new ShellStep('TestAPIGatewayEndpoint', {
      commands: ['curl -H "Content-Type: application/json" -X POST  $ENDPOINT_URL/scan -d \'{\"id\":\"12345\",\"name\": \"Iphone 13 pro max\",\"price\":2000}\''],
      envFromCfnOutputs: {
        ENDPOINT_URL: deploy.apgwEndpointUrl
      }
    })
  )

  }
}
