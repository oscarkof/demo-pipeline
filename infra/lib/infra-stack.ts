import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { ApplicationPipelineStage } from './pipeline-app-stage';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const synthStep = new ShellStep('Synth', {
      input: CodePipelineSource.gitHub('demo-pipeline/demo-pipeline', 'main'),
      commands: [
        'npm ci',
        'npm run build',
        'npm run test',
        'npx cdk synth'
      ]
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'PipelineDemo',
      synth: synthStep
    });

    const deploy = new ApplicationPipelineStage(this, 'Deploy');
    const deployStage = pipeline.addStage(deploy);

    deployStage.addPost(new ShellStep('TestAPIGatewayEndpoint', {
      commands: ['curl -Ssf $ENDPOINT_URL'],
      envFromCfnOutputs: {
        ENDPOINT_URL: deploy.apgwEndpointUrl
      }
    })
  )

  }
}
