import { defineBackend } from '@aws-amplify/backend';
import { Tags } from 'aws-cdk-lib';
import { auth } from './auth/resource';
import { createCheckerRuntime } from './agent/resource';

// Amplify標準バックエンドのうち、認証機能を利用
const backend = defineBackend({
  auth,
});

// SCP準拠のためスタック全体にタグを付与
Tags.of(backend.stack).add('Project', 'amplify-agentcore');
Tags.of(backend.stack).add('Environment', 'production');
Tags.of(backend.stack).add('ManagedBy', 'amplify');

// AgentCore（Amplify標準外）用のCDKスタックを作成
const agentCoreStack = backend.createStack('AgentCoreStack');
Tags.of(agentCoreStack).add('Project', 'amplify-agentcore');
Tags.of(agentCoreStack).add('Environment', 'production');
Tags.of(agentCoreStack).add('ManagedBy', 'amplify');

// checker専用AgentCoreランタイムを作成
const { runtime: checkerRuntime } = createCheckerRuntime(
  agentCoreStack,
  backend.auth.resources.userPool,
  backend.auth.resources.userPoolClient
);

// ランタイムARNを出力に追加
backend.addOutput({
  custom: {
    checkerAgentRuntimeArn: checkerRuntime.agentRuntimeArn,
  },
});
