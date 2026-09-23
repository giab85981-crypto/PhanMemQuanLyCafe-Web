import { useState } from "react";
import { Info } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const RANGE_OPTIONS = ["Hôm nay", "7 ngày qua", "30 ngày qua"];
const GROUP_TABS = ["Theo giờ", "Theo ngày", "Theo thứ"];

// Formats 50000 -> "50 N" (nghìn), 1200000 -> "1.2 Tr" (triệu), matching KiotViet's axis style.
function formatCompactVnd(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)} Tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)} N`;
  return String(value);
}

/**
 * title: panel title, e.g. "Doanh thu thuần"
 * infoTooltip: optional text for the small info icon next to the title
 * summaryValue: big bold number shown under the title, e.g. "50,000" or "1"
 * summaryDetail: small gray text next to summaryValue, e.g. "(1 hóa đơn)" or "lượt khách"
 * emptyState: text shown under the empty chart, e.g. "Bạn chưa bán đơn nào"
 * data: [{ label: string, value: number }]
 * type: "bar" | "line"
 * formatAxis: "currency" (compact "N"/"Tr") | "number" (plain)
 * onRangeChange(range), onGroupChange(group): optional, to refetch from your API
 */
export default function TrendChart({
  title,
  infoTooltip,
  summaryValue,
  summaryDetail,
  emptyState,
  data = [],
  type = "bar",
  formatAxis = "currency",
  onRangeChange,
  onGroupChange,
}) {
  const [range, setRange] = useState(RANGE_OPTIONS[1]);
  const [group, setGroup] = useState(GROUP_TABS[0]);

  const isEmpty = data.every((d) => !d.value);
  const yTickFormatter = formatAxis === "currency" ? formatCompactVnd : (v) => v;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="flex items-center gap-1.5 text-[15px] font-medium text-slate-700">
          {title}
          {infoTooltip && <Info size={14} className="text-slate-400" title={infoTooltip} />}
        </span>
        <select
          value={range}
          onChange={(e) => {
            setRange(e.target.value);
            onRangeChange?.(e.target.value);
          }}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600"
        >
          {RANGE_OPTIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      {summaryValue !== undefined && (
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-slate-800">{summaryValue}</span>
          {summaryDetail && <span className="text-sm text-slate-500">{summaryDetail}</span>}
        </div>
      )}

      <div className="mt-4 flex gap-5 border-b border-slate-100">
        {GROUP_TABS.map((g) => (
          <button
            key={g}
            onClick={() => {
              setGroup(g);
              onGroupChange?.(g);
            }}
            className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors ${
              group === g
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="mt-4 h-52">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
            <MiniChartPlaceholder type={type} />
            <span className="text-sm">{emptyState}</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={yTickFormatter}
                  width={44}
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(v) => v.toLocaleString("vi-VN")} />
                <Bar dataKey="value" fill="#2f7dfa" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={yTickFormatter}
                  width={36}
                />
                <Tooltip formatter={(v) => v.toLocaleString("vi-VN")} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2f7dfa"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#2f7dfa", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function MiniChartPlaceholder({ type }) {
  if (type === "bar") {
    return (
      <div className="flex items-end gap-1.5">
        {[10, 22, 14, 30, 18].map((h, i) => (
          <div key={i} className="w-3 rounded-t bg-sky-200" style={{ height: h }} />
        ))}
      </div>
    );
  }
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none">
      <path d="M2 24 L16 12 L30 20 L44 6 L62 16" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}