import { defineAuth } from '@aws-amplify/backend';

// 認証設定（メールアドレスでログイン + TOTP MFA必須）
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  multifactor: {
    mode: 'REQUIRED',
    totp: true,
  },
});
