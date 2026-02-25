import { useState, useCallback } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import type { AnalysisResult } from '../types';
import { runAiAnalysis } from '../aiAnalysis';
import { ScoreGauge } from './ScoreGauge';
import { SheetMap } from './SheetMap';
import { CostChart } from './CostChart';
import { FindingsTable } from './FindingsTable';
import { Recommendations } from './Recommendations';
import { SheetDetail } from './SheetDetail';
import outputs from '../../../amplify_outputs.json';

const CHECKER_AGENT_ARN = outputs.custom?.checkerAgentRuntimeArn;

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

type Tab = '概要' | '検出事項' | 'AI提案' | 'シート詳細';
const TABS: Tab[] = ['概要', '検出事項', 'AI提案', 'シート詳細'];

export function Dashboard({ result, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('概要');
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

  // AI分析の状態
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

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

  // AI分析を実行
  const executeAiAnalysis = useCallback(async (accessToken: string) => {
    if (!CHECKER_AGENT_ARN) {
      setAiError('checker用エージェントのARNが設定されていません');
      return;
    }

    setAiText('');
    setAiLoading(true);
    setAiError(null);

    await runAiAnalysis({
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

  // AI分析ボタンのハンドラー（認証チェック付き）
  const handleRunAi = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      if (accessToken) {
        // トークンあり → AI分析を実行
        executeAiAnalysis(accessToken);
      } else {
        // トークンなし → 認証モーダルを表示
        setShowAuth(true);
      }
    } catch {
      // 未認証 → 認証モーダルを表示
      setShowAuth(true);
    }
  }, [executeAiAnalysis]);

  // 認証完了後にAI分析を実行
  const handleAuthSuccess = useCallback(async () => {
    setShowAuth(false);
    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();
      if (accessToken) {
        executeAiAnalysis(accessToken);
      }
    } catch {
      setAiError('認証後のトークン取得に失敗しました');
    }
  }, [executeAiAnalysis]);

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 sm:p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">解析結果ダッシュボード</h1>
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
        >
          別のファイルを解析
        </button>
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

      {activeTab === 'AI提案' && (
        <Recommendations
          recommendations={result.recommendations}
          aiText={aiText}
          aiLoading={aiLoading}
          aiError={aiError}
          onRunAi={handleRunAi}
        />
      )}

      {activeTab === 'シート詳細' && (
        <SheetDetail
          sheets={result.sheets}
          findings={result.allFindings}
          selectedSheet={selectedSheet}
          onSelect={setSelectedSheet}
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
