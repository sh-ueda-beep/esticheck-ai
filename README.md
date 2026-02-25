# EstiCheck AI — 見積 AI チェッカー

契約見積Excelファイル（.xlsx）をアップロードすると、AIエージェントが構造解析・エラー検出・品質スコアリングを自動的に行うWebアプリ。AWS Amplify Gen2 + Bedrock AgentCore を使ったフルスタック・フルサーバーレス構成。

![画面イメージ](docs/assets/main.png)

### 特徴

- フルサーバーレスなので維持費激安。ほぼLLMのAPI料金のみで運用できます。
- エンプラReadyなセキュリティ。Cognito認証付き、東京リージョン対応。WAFでIP制限もできます。
- Excelの契約見積書をアップロードするだけで、AIエージェントが構造解析・エラー検出・品質スコアリングを自動実行。

### アーキテクチャ

- フロントエンド： React + Vite + Tailwind CSS
- バックエンド： Bedrock AgentCoreランタイム（checker-agent）
- インフラ： Amplify Gen2 + AWS CDK
- 認証： Amazon Cognito

### コマンド

```bash
npm run dev          # Viteフロントエンド開発サーバー
npm run build        # TypeScriptチェック + Viteビルド
npx ampx sandbox     # ローカル開発用の占有インフラを一時デプロイ
```

### デプロイ手順

1. このリポジトリを自分のGitHubアカウントにフォーク
2. Amplify Gen2にリポジトリのURLを登録

→ これだけで自動的にフロントエンド＆バックエンドがデプロイされます。

### 便利なTips

- `npx ampx sandbox` でローカル開発用の占有インフラを一時デプロイできます。
- `dev` など新しいブランチをAmplifyにプッシュすると、検証環境などを簡単に増やせます。