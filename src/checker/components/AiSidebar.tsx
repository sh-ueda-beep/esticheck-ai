import ReactMarkdown from 'react-markdown';
import type { Recommendation, Priority } from '../types';

interface Props {
  recommendations: Recommendation[];
  selectedRec: Recommendation | null;
  onSelectRec: (rec: Recommendation) => void;
  aiText: string;
  aiLoading: boolean;
  aiError: string | null;
  onClose: () => void;
}

const PRIORITY_ICON_STYLES: Record<Priority, string> = {
  '高': 'bg-red-500',
  '中': 'bg-yellow-500',
  '低': 'bg-blue-500',
  '情報': 'bg-slate-500',
};

export function AiSidebar({ recommendations, selectedRec, onSelectRec, aiText, aiLoading, aiError, onClose }: Props) {
  return (
    <div className="w-[420px] flex-shrink-0 bg-slate-800/80 border-l border-slate-700 flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
          </svg>
          <h2 className="text-sm font-semibold text-white">AIアシスタント</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 推奨項目リスト（独自スクロール、max-h制限付き） */}
      <div className="overflow-y-auto max-h-[40vh] flex-shrink-0">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">推奨項目</h3>
          {recommendations.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">改善提案はありません</div>
          ) : (
            <div className="space-y-2">
              {recommendations.map((rec, i) => {
                const isSelected = selectedRec === rec;
                return (
                  <button
                    key={i}
                    onClick={() => onSelectRec(rec)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_ICON_STYLES[rec.priority]}`} />
                      <span className="text-xs font-medium text-white truncate">{rec.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 ml-4">{rec.description}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AIレビュー表示エリア（残りスペースで独自スクロール） */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 pb-4">
          {selectedRec ? (
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-t border-slate-700 pt-4">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_ICON_STYLES[selectedRec.priority]}`} />
                <h3 className="text-xs font-semibold text-slate-300">{selectedRec.title} のAIレビュー</h3>
              </div>

              {/* ローディング表示 */}
              {aiLoading && !aiText && (
                <div className="flex items-center gap-3 py-6 justify-center text-slate-400">
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-xs">AIが分析中...</span>
                </div>
              )}

              {/* エラー表示 */}
              {aiError && (
                <div className="p-3 rounded-lg border border-red-800 bg-red-900/30 text-red-300 text-xs mb-3">
                  {aiError}
                </div>
              )}

              {/* AIストリーミング結果 */}
              {aiText && (
                <div className="p-3 rounded-lg border border-slate-700 bg-slate-800/50 prose prose-invert prose-xs max-w-none text-xs">
                  <ReactMarkdown>{aiText}</ReactMarkdown>
                  {aiLoading && (
                    <span className="inline-block w-1.5 h-3 bg-blue-400 animate-pulse ml-0.5" />
                  )}
                </div>
              )}
            </div>
          ) : (
            /* 未選択時の案内 */
            <div className="text-slate-500 text-xs py-8 text-center border-t border-slate-700 mt-0 pt-6">
              項目をクリックするとAIが詳細レビューを行います
              <br />
              <span className="text-[10px] text-slate-600">※ ログインが必要です</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
