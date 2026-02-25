import { useState, useCallback } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import type { AnalysisResult, Recommendation } from '../types';
import { runAiReviewForRecommendation } from '../aiAnalysis';
import { ScoreGauge } from './ScoreGauge';
import { SheetMap } from './SheetMap';
import { CostChart } from './CostChart';
import { FindingsTable } from './FindingsTable';
import { AiSidebar } from './AiSidebar';
import { SheetDetail } from './SheetDetail';
import outputs from '../../../amplify_outputs.json';

const CHECKER_AGENT_ARN = outputs.custom?.checkerAgentRuntimeArn;

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

type Tab = '概要' | '検出事項' | 'シート詳細';
const TABS: Tab[] = ['概要', '検出事項', 'シート詳細'];

export function Dashboard({ result, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('概要');
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

  // サイドバー状態
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  // AI分析の状態
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  // 認証後に実行するための保持用ref
  const [pendingRec, setPendingRec] = useState<Recommendation | null>(null);

  // 統計値の集計
  const totalSheets = result.sheets.length;
  const totalFormulas = result.sheets.reduce((s, sh) => s + sh.formulaCount, 0);
  const totalErrors = result.allFindings.filter(f => f.severity === '重大').length;
  const totalMerges = result.sheets.reduce((s, sh) => s + sh.mergeCount, 0);
  const totalCrossRefs = result.sheets.reduce((s, sh) => s + sh.crossRefs.length, 0);

  const handleSheetSelect = (name: string) => {
    setSelectedSheet(name);
    setActiveTab('シート詳細');
  };

  // 特定の推奨項目に対するAIレビューを実行
  const executeAiReview = useCallback(async (rec: Recommendation, accessToken: string) => {
    if (!CHECKER_AGENT_ARN) {
      setAiError('checker用エージェントのARNが設定されていません');
      return;
    }

    setAiText('');
    setAiLoading(true);
    setAiError(null);

    await runAiReviewForRecommendation({
      recommendation: rec,
      analysisResult: result,
      accessToken,
      agentArn: CHECKER_AGENT_ARN,
      onText: (text) => setAiText(prev => prev + text),
      onDone: () => setAiLoading(false),
      onError: (err) => {
        setAiError(err.message);
        setAiLoading(false);
      },
    });
  }, [result]);

  // 推奨項目クリック時のハンドラー（認証チェック付き）
  const handleSelectRec = useCallback(async (rec: Recommendation) => {
    setSelectedRec(rec);
    setAiText('');
    setAiError(null);

    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      if (accessToken) {
        executeAiReview(rec, accessToken);
      } else {
        setPendingRec(rec);
        setShowAuth(true);
      }
    } catch {
      setPendingRec(rec);
      setShowAuth(true);
    }
  }, [executeAiReview]);

  // 認証完了後にAIレビューを実行
  const handleAuthSuccess = useCallback(async () => {
    setShowAuth(false);
    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();
      if (accessToken && pendingRec) {
        executeAiReview(pendingRec, accessToken);
        setPendingRec(null);
      }
    } catch {
      setAiError('認証後のトークン取得に失敗しました');
    }
  }, [executeAiReview, pendingRec]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* メインエリア */}
      <div className="flex-1 min-w-0 p-4 sm:p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">解析結果ダッシュボード</h1>
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
                AI
              </button>
            )}
            <button
              onClick={onReset}
              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              別のファイルを解析
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="flex gap-1 mb-6 border-b border-slate-700 pb-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-[1px]
                ${activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        {activeTab === '概要' && (
          <div className="space-y-6">
            {/* スコアゲージ + 統計カード */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <ScoreGauge score={result.qualityScore.score} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
                {[
                  { label: '総シート数', value: totalSheets, color: 'text-blue-400' },
                  { label: '総数式数', value: totalFormulas, color: 'text-purple-400' },
                  { label: '総エラー数', value: totalErrors, color: totalErrors > 0 ? 'text-red-400' : 'text-green-400' },
                  { label: '総結合セル数', value: totalMerges, color: 'text-yellow-400' },
                  { label: 'クロスシート参照', value: totalCrossRefs, color: 'text-cyan-400' },
                  { label: '品質スコア', value: result.qualityScore.score, color: result.qualityScore.score >= 80 ? 'text-green-400' : result.qualityScore.score >= 60 ? 'text-yellow-400' : 'text-red-400' },
                ].map(card => (
                  <div key={card.label} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700">
                    <div className="text-[10px] text-slate-500 uppercase">{card.label}</div>
                    <div className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* シートマップ */}
            <SheetMap sheets={result.sheets} onSelect={handleSheetSelect} />

            {/* 費目構成チャート */}
            <CostChart costStructure={result.costStructure} />
          </div>
        )}

        {activeTab === '検出事項' && (
          <FindingsTable findings={result.allFindings} />
        )}

        {activeTab === 'シート詳細' && (
          <SheetDetail
            sheets={result.sheets}
            findings={result.allFindings}
            selectedSheet={selectedSheet}
            onSelect={setSelectedSheet}
          />
        )}
      </div>

      {/* AIサイドバー */}
      {sidebarOpen && (
        <AiSidebar
          recommendations={result.recommendations}
          selectedRec={selectedRec}
          onSelectRec={handleSelectRec}
          aiText={aiText}
          aiLoading={aiLoading}
          aiError={aiError}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* 認証モーダル */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 text-lg"
            >
              x
            </button>
            <h3 className="text-white font-semibold mb-4 text-center">AI分析にはログインが必要です</h3>
            <Authenticator>
              {() => {
                // 認証成功時に自動実行
                handleAuthSuccess();
                return (
                  <div className="text-center text-slate-400 py-4">
                    認証完了。AI分析を開始しています...
                  </div>
                );
              }}
            </Authenticator>
          </div>
        </div>
      )}
    </div>
  );
}
