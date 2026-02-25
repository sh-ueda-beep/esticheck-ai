import type { Sheet, Finding } from '../types';

interface Props {
  sheets: Sheet[];
  findings: Finding[];
  selectedSheet: string | null;
  onSelect: (name: string) => void;
}

export function SheetDetail({ sheets, findings, selectedSheet, onSelect }: Props) {
  const sheet = sheets.find(s => s.name === selectedSheet);
  const sheetFindings = findings.filter(f => f.sheet === selectedSheet);

  return (
    <div className="flex gap-4 h-[500px]">
      {/* 左サイドバー: シート選択 */}
      <div className="w-48 shrink-0 overflow-y-auto border-r border-slate-700 pr-3">
        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">シート一覧</h4>
        {sheets.map(s => (
          <button
            key={s.name}
            onClick={() => onSelect(s.name)}
            className={`
              block w-full text-left px-3 py-2 rounded text-sm mb-1 transition-colors
              ${s.name === selectedSheet ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800'}
            `}
          >
            <div className="truncate">{s.name}</div>
            {s.errorCount > 0 && (
              <span className="text-[10px] text-red-400">エラー {s.errorCount}件</span>
            )}
          </button>
        ))}
      </div>

      {/* 右ペイン: シート詳細 */}
      <div className="flex-1 overflow-y-auto">
        {!sheet ? (
          <div className="text-slate-500 text-sm py-8 text-center">左のリストからシートを選択してください</div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{sheet.name}</h3>

            {/* 基本情報 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: '行数', value: sheet.rows },
                { label: '列数', value: sheet.cols },
                { label: '数式数', value: sheet.formulaCount },
                { label: '結合セル', value: sheet.mergeCount },
                { label: 'エラー', value: sheet.errorCount },
                { label: '複雑度', value: sheet.complexity === 'high' ? '高' : sheet.complexity === 'medium' ? '中' : '低' },
              ].map(item => (
                <div key={item.label} className="bg-slate-800 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 uppercase">{item.label}</div>
                  <div className="text-lg font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>

            {/* クロスシート参照 */}
            {sheet.crossRefs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">クロスシート参照 ({sheet.crossRefs.length}件)</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {sheet.crossRefs.map((ref, i) => (
                    <div key={i} className="text-xs text-slate-400 bg-slate-800 rounded px-2 py-1">
                      {ref.fromCell} → {ref.toSheet}!{ref.toCell}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* このシートの検出事項 */}
            {sheetFindings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">検出事項 ({sheetFindings.length}件)</h4>
                <div className="space-y-1">
                  {sheetFindings.map((f, i) => (
                    <div key={i} className="text-xs text-slate-400 bg-slate-800 rounded px-2 py-1">
                      <span className={
                        f.severity === '重大' ? 'text-red-400' :
                        f.severity === '警告' ? 'text-yellow-400' : 'text-blue-400'
                      }>
                        [{f.severity}]
                      </span>{' '}
                      {f.message} {f.cell ? `(${f.cell})` : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
