import type { PipelineStep } from '../types';

const ALL_STEPS = [
  { id: 1, name: '構造解析' },
  { id: 2, name: '名前定義抽出' },
  { id: 3, name: '費目認識' },
  { id: 4, name: '整合性チェック' },
  { id: 5, name: '異常値検出' },
  { id: 6, name: '品質スコア・提案生成' },
];

interface Props {
  steps: PipelineStep[];
  logs: string[];
}

export function AnalyzingScreen({ steps, logs }: Props) {
  const completedCount = steps.filter(s => s.status === 'done').length;
  const progress = (completedCount / ALL_STEPS.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] px-4">
      <h2 className="text-2xl font-bold text-white mb-6">解析中...</h2>

      {/* プログレスバー */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>進捗</span>
          <span>{completedCount}/{ALL_STEPS.length} ステップ</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ステップ一覧 */}
      <div className="w-full max-w-lg space-y-2 mb-6">
        {ALL_STEPS.map((step) => {
          const current = steps.find(s => s.id === step.id);
          const status = current?.status ?? 'pending';
          return (
            <div key={step.id} className="flex items-center gap-3 text-sm">
              <span className="w-5 h-5 flex items-center justify-center">
                {status === 'done' && <span className="text-green-400">✓</span>}
                {status === 'running' && (
                  <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                )}
                {status === 'pending' && <span className="text-slate-600">○</span>}
              </span>
              <span className={status === 'done' ? 'text-green-400' : status === 'running' ? 'text-blue-400' : 'text-slate-500'}>
                Step {step.id}: {step.name}
              </span>
              {current?.message && (
                <span className="text-slate-500 text-xs ml-auto">{current.message}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Agent実行ログ（ターミナル風） */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-lg p-3 h-40 overflow-y-auto font-mono text-xs">
        <div className="text-slate-500 mb-1">{'>'} Agent実行ログ</div>
        {logs.map((log, i) => (
          <div key={i} className="text-slate-300">{log}</div>
        ))}
        {logs.length === 0 && <div className="text-slate-600">待機中...</div>}
      </div>
    </div>
  );
}
