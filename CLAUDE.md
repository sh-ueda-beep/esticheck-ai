# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

AWS Amplify Gen2 + Bedrock AgentCore を使ったフルスタック・フルサーバーレスのAIエージェントWebアプリ。Cognito認証付きのReactチャットフロントエンドから、コンテナ化されたエージェントランタイムにSSEストリーミングで通信する。

## コマンド

```bash
npm run dev          # Viteフロントエンド開発サーバー
npm run build        # TypeScriptチェック + Viteビルド
npx ampx sandbox     # ローカル開発用の占有インフラを一時デプロイ
```

デプロイはAmplify Gen2経由で自動化されている（`npx ampx pipeline-deploy`）。ブランチをpushすれば自動デプロイされる。

## アーキテクチャ

### バックエンド（amplify/）

- **`backend.ts`** — エントリポイント。Amplify標準のauth機能を定義した上で、`backend.createStack()`でAgentCore用の独立CDKスタックを作成。ランタイムARNをフロントエンド向けに出力する。
- **`auth/resource.ts`** — Cognitoユーザープール設定（メールログイン）。
- **`agent/resource.ts`** — checker専用AgentCoreランタイムのCDKリソース定義。CodeBuildでARM64 Dockerイメージをビルド（`deploy-time-build`利用）、Cognito認証をランタイムに設定、Bedrock呼び出し権限を付与。

重要パターン：Amplify Gen2標準リソース（auth）とカスタムCDKスタック（AgentCore）が`backend.createStack()`で共存している。

### フロントエンド（src/）

- **`main.tsx`** — Amplify初期化 + `<Authenticator>`ラッパー（日本語ロケール）。ルーティングでcheckerのみ表示。

フロントエンドは`amplify_outputs.json`からランタイムARNと認証設定を読み取る。

## 主要な依存関係

- `@aws-cdk/aws-bedrock-agentcore-alpha` — AgentCoreのL2 CDKコンストラクト（alpha版）
- `@strands-agents/sdk` — エージェントフレームワーク（ツール定義・モデル・ストリーミング）
- `bedrock-agentcore` — AgentCoreランタイムSDK
- `deploy-time-build` — CDKデプロイ時にCodeBuildでDockerイメージをビルド
- `aws-cdk-lib@2.233.0` — CDKバージョン（agentcore-alphaと合わせる必要あり）
- `@aws-sdk/client-cloudformation` — `3.936.0`にルートpackage.jsonのoverridesで固定

## 規約

- コード内コメントは日本語で記述
- バックエンドはES2022モジュール（amplify/package.jsonで`"type": "module"`）
- エージェントツールの入力バリデーションにはZodスキーマを使用
