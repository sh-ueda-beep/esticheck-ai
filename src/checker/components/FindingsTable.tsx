import { useState } from 'react';
import type { Finding, Severity } from '../types';

interface Props {
  findings: Finding[];
}

const SEVERITY_STYLES: Record<Severity, { badge: string; bg: string }> = {
  '重大': { badge: 'bg-red-600 text-white', bg: 'bg-red-500/5' },
  '警告': { badge: 'bg-yellow-600 text-white', bg: 'bg-yellow-500/5' },
  '情報': { badge: 'bg-blue-600 text-white', bg: 'bg-blue-500/5' },
};

const SEVERITIES: Severity[] = ['重大', '警告', '情報'];

export function FindingsTable({ findings }: Props) {
  const [filter, setFilter] = useState<Severity | 'all'>('all');

  const filtered = filter === 'all' ? findings : findings.filter(f => f.severity === filter);

  // 件数集計
  const counts = Object.fromEntries(
    SEVERITIES.map(s => [s, findings.filter(f => f.severity === s).length])
  ) as Record<Severity, number>;

  return (
    <div>
      {/* フィルタボタン */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded text-xs ${filter === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          すべて ({findings.length})
        </button>
        {SEVERITIES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded text-xs ${filter === s ? SEVERITY_STYLES[s].badge : 'bg-slate-800 text-slate-400'}`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* 検出事項一覧 */}
      {filtered.length === 0 ? (
        <div className="text-slate-500 text-sm py-8 text-center">検出事項はありません</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f, i) => (
            <div key={i} className={`p-3 rounded-lg border border-slate-700 ${SEVERITY_STYLES[f.severity].bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${SEVERITY_STYLES[f.severity].badge}`}>
                  {f.severity}
                </span>
                <span className="text-sm text-white">{f.message}</span>
                <span className="text-xs text-slate-500 ml-auto">{f.sheet}{f.cell ? ` / ${f.cell}` : ''}</span>
              </div>
              <div className="text-xs text-slate-400">{f.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
