import { Sparkle } from "lucide-react";

const TONES = {
  blue: { bar: "bg-sky-500", bg: "bg-gradient-to-br from-sky-50 to-white" },
  green: { bar: "bg-emerald-500", bg: "bg-gradient-to-br from-emerald-50 to-white" },
  amber: { bar: "bg-amber-500", bg: "bg-gradient-to-br from-amber-50 to-white" },
};

/**
 * rows: [{ label: string, value: string|number }]
 * badge: optional small text next to the title, e.g. "Bao gồm VAT"
 * subtitle: gray text shown when there's nothing new, e.g. "Không phát sinh doanh thu"
 * highlight: text shown in green with a sparkle icon instead of subtitle, e.g. "Doanh thu mới" —
 *   pass this when the value just changed/increased; omit (or leave undefined) to fall back to subtitle.
 */
export default function StatCard({ tone = "blue", title, badge, value, subtitle, highlight, rows = [] }) {
  const t = TONES[tone];
  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-100 ${t.bg} p-5 shadow-sm`}>
      <span className={`absolute left-0 top-0 h-full w-1 ${t.bar}`} />
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-medium text-slate-600">{title}</span>
        {badge && <span className="text-xs text-slate-500">{badge}</span>}
      </div>

      <div className="mt-2 text-3xl font-semibold text-slate-800">{value}</div>

      {highlight ? (
        <div className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-600">
          <span>{highlight}</span>
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-emerald-500">
            <Sparkle size={8} fill="currentColor" />
          </span>
        </div>
      ) : (
        subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
      )}

      {rows.length > 0 && (
        <div className="mt-5 space-y-2.5 border-t border-slate-200/70 pt-3">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{r.label}</span>
              <span className="font-medium text-slate-700">{r.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}