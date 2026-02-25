import ReactMarkdown from 'react-markdown';
import type { Recommendation, Priority } from '../types';

interface Props {
  recommendations: Recommendation[];
  aiText?: string;
  aiLoading?: boolean;
  aiError?: string | null;
  onRunAi?: () => void;
}

const PRIORITY_STYLES: Record<Priority, string> = {
  '高': 'bg-red-600',
  '中': 'bg-yellow-600',
  '低': 'bg-blue-600',
  '情報': 'bg-slate-600',
};

export function Recommendations({ recommendations, aiText, aiLoading, aiError, onRunAi }: Props) {
  return (
    <div className="space-y-6">
      {/* ルールベース推奨 */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">ルールベース分析</h3>
        {recommendations.length === 0 ? (
          <div className="text-slate-500 text-sm py-4 text-center">改善提案はありません</div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium text-white ${PRIORITY_STYLES[rec.priority]}`}>
                    {rec.priority}
                  </span>
                  <h4 className="text-sm font-semibold text-white">{rec.title}</h4>
                </div>
                <p className="text-xs text-slate-300 mb-2">{rec.description}</p>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-slate-500">推奨アクション: </span>
                    <span className="text-slate-300">{rec.action}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">影響: </span>
                    <span className="text-slate-300">{rec.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI分析セクション */}
      <div className="border-t border-slate-700 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">AI詳細分析</h3>
          {onRunAi && !aiLoading && (
            <button
              onClick={onRunAi}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={aiLoading}
            >
              {aiText ? 'AIで再分析' : 'AIで詳細分析'}
            </button>
          )}
        </div>

        {/* ローディング表示 */}
        {aiLoading && !aiText && (
          <div className="flex items-center gap-3 py-8 justify-center text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">AIが分析中...</span>
          </div>
        )}

        {/* エラー表示 */}
        {aiError && (
          <div className="p-3 rounded-lg border border-red-800 bg-red-900/30 text-red-300 text-sm mb-3">
            {aiError}
          </div>
        )}

        {/* AIストリーミング結果 */}
        {aiText && (
          <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{aiText}</ReactMarkdown>
            {aiLoading && (
              <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-0.5" />
            )}
          </div>
        )}

        {/* 未実行時の説明 */}
        {!aiText && !aiLoading && !aiError && (
          <div className="text-slate-500 text-sm py-4 text-center">
            「AIで詳細分析」ボタンをクリックすると、AIが分析結果を基に具体的な改善提案を生成します。
            <br />
            <span className="text-xs text-slate-600">※ ログインが必要です</span>
          </div>
        )}
      </div>
    </div>
  );
}
