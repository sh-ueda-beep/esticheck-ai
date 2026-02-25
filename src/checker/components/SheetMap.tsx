import type { Sheet } from '../types';

interface Props {
  sheets: Sheet[];
  onSelect?: (name: string) => void;
}

function getBorderColor(sheet: Sheet): string {
  if (sheet.errorCount > 0) return 'border-red-500';
  if (sheet.complexity === 'high') return 'border-yellow-500';
  return 'border-green-500';
}

function getBgColor(sheet: Sheet): string {
  if (sheet.errorCount > 0) return 'bg-red-500/10';
  if (sheet.complexity === 'high') return 'bg-yellow-500/10';
  return 'bg-green-500/10';
}

export function SheetMap({ sheets, onSelect }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3">シートマップ</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {sheets.map((sheet) => (
          <button
            key={sheet.name}
            onClick={() => onSelect?.(sheet.name)}
            className={`
              p-2 rounded-lg border-2 text-left transition-colors cursor-pointer
              hover:opacity-80 ${getBorderColor(sheet)} ${getBgColor(sheet)}
            `}
          >
            <div className="text-xs font-medium text-white truncate">{sheet.name}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {sheet.rows}×{sheet.cols} | 数式{sheet.formulaCount}
            </div>
            <div className="text-[10px] text-slate-500">
              複雑度: {sheet.complexity === 'high' ? '高' : sheet.complexity === 'medium' ? '中' : '低'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
