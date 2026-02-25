import { Stack, Fn } from 'aws-cdk-lib';
import * as agentcore from '@aws-cdk/aws-bedrock-agentcore-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { ContainerImageBuild } from 'deploy-time-build';
import { IUserPool, IUserPoolClient } from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import { fileURLToPath } from 'url';

// checker専用のAgentCoreランタイムを作成する関数
export function createCheckerRuntime(
  stack: Stack,
  userPool: IUserPool,
  userPoolClient: IUserPoolClient
) {
  // CodeBuildでARM64イメージをビルド（checker-agentディレクトリ）
  const checkerImage = new ContainerImageBuild(stack, 'CheckerAgentImage', {
    directory: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'checker-agent'),
    platform: Platform.LINUX_ARM64,
  });

  const envId = Fn.select(2, Fn.split('-', stack.stackName));

  // checker専用AgentCoreランタイム（ブラウザ不要）
  const runtime = new agentcore.Runtime(stack, 'CheckerRuntime', {
    runtimeName: `checker_agent_${envId}`,
    agentRuntimeArtifact: agentcore.AgentRuntimeArtifact.fromEcrRepository(
      checkerImage.repository,
      checkerImage.imageTag
    ),
    authorizerConfiguration: agentcore.RuntimeAuthorizerConfiguration.usingCognito(
      userPool,
      [userPoolClient],
    ),
    networkConfiguration: agentcore.RuntimeNetworkConfiguration.usingPublicNetwork(),
  });

  // Bedrock InvokeModel権限のみ（ブラウザ権限は不要）
  runtime.addToRolePolicy(
    new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream'
      ],
      resources: [
        'arn:aws:bedrock:*::foundation-model/*',
        'arn:aws:bedrock:*:*:inference-profile/*',
      ],
    })
  );

  return { runtime };
}
