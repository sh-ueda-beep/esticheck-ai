import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CostItem } from '../types';

interface Props {
  costStructure: CostItem[];
}

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#ec4899', '#06b6d4', '#f97316'];

export function CostChart({ costStructure }: Props) {
  // カテゴリ別に集計
  const categoryTotals = new Map<string, number>();
  for (const item of costStructure) {
    if (item.value == null) continue;
    categoryTotals.set(item.category, (categoryTotals.get(item.category) ?? 0) + item.value);
  }

  const data = Array.from(categoryTotals.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return <div className="text-slate-500 text-sm">費目データが検出されませんでした</div>;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3">費目構成</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value) => [`${Number(value).toLocaleString()}円`, '金額']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
