// 必要なパッケージをインポート
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Amplify } from "aws-amplify";
import { I18n } from 'aws-amplify/utils';
import { Authenticator, translations } from '@aws-amplify/ui-react';
import { CheckerApp } from "./checker/CheckerApp.tsx";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import "./index.css";

// Amplifyの初期化
Amplify.configure(outputs);

// 認証画面を日本語化
I18n.putVocabularies(translations);
I18n.setLanguage('ja');

// アプリケーションのエントリーポイント
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator>
      <BrowserRouter>
        <Routes>
          <Route path="/checker" element={<CheckerApp />} />
          <Route path="*" element={<Navigate to="/checker" replace />} />
        </Routes>
      </BrowserRouter>
    </Authenticator>
  </React.StrictMode>
);
