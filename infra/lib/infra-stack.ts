import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'PipelineDemo',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection('oscarkof/demo-devops', 'main', {
          connectionArn: 'arn:aws:codestar-connections:us-east-1:702944629921:connection/42daae90-0ffc-4dce-9f91-308a9f2defa4', // Created using the AWS code pipeline console 
        }),
        commands: ['npm install -g aws-cdk','npm install -D esbuild', 'pwd', 'cd demo-infra', 'npm run prebuild', 'npm run build', 'cdk synth', 'mv cdk.out ../']
      })
    });
  }
}
