import { useState } from "react";
import { Utensils, Beef, CupSoda, ChevronDown, ChevronLeft, ChevronRight, PieChart as PieIcon, Inbox } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const METRICS = [
  { icon: Utensils, label: "Giá trị trung bình/món", value: 0 },
  { icon: Beef, label: "Giá trị trung bình/đồ ăn", value: 0 },
  { icon: CupSoda, label: "Giá trị trung bình/đồ uống", value: 0 },
];

const DONUT_COLORS = ["#2f7dfa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa"];
const PAGE_SIZE = 10;

/**
 * groups: [{ name, value }] — revenue share per menu group, drives the donut + legend
 * topDishes: [{ name, qty, revenue }] — leave empty to show the empty state
 * selectedGroup: which group's detail table is showing, e.g. "nước"
 */
export default function MenuEfficiency({ metrics = METRICS, groups = [], topDishes = [], selectedGroup }) {
  const [mode, setMode] = useState("group"); // "group" | "category"
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(topDishes.length / PAGE_SIZE));
  const pageStart = page * PAGE_SIZE;
  const pageRows = topDishes.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-medium text-slate-700">Hiệu quả thực đơn</span>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-slate-100 p-0.5 text-sm">
            <button
              onClick={() => setMode("group")}
              className={`rounded-full px-3 py-1 font-medium ${
                mode === "group" ? "bg-sky-500 text-white" : "text-slate-500"
              }`}
            >
              Theo nhóm
            </button>
            <button
              onClick={() => setMode("category")}
              className={`rounded-full px-3 py-1 font-medium ${
                mode === "category" ? "bg-sky-500 text-white" : "text-slate-500"
              }`}
            >
              Theo loại
            </button>
          </div>
          <select className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex divide-x divide-slate-100">
        {metrics.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-1 items-center gap-3 px-4 first:pl-0">
            <Icon size={26} className="text-slate-500" />
            <div>
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-lg font-semibold text-slate-800">{value.toLocaleString("vi-VN")}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-100 p-4">
          <div className="mb-3 text-sm font-medium text-slate-600">Nhóm món</div>
          {groups.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-500">
              <PieIcon size={40} strokeWidth={1.5} className="text-sky-200" />
              <span className="text-sm">Chưa có doanh thu theo nhóm món</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={groups}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="85%"
                      paddingAngle={groups.length > 1 ? 2 : 0}
                    >
                      {groups.map((g, i) => (
                        <Cell key={g.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => v.toLocaleString("vi-VN")} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {groups.map((g, i) => (
                  <div key={g.name} className="flex items-center gap-1.5 text-sm text-slate-600">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                    />
                    {g.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Chi tiết từng nhóm món</span>
            <button className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
              {selectedGroup || "Chọn nhóm"} <ChevronDown size={14} />
            </button>
          </div>

          {topDishes.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-slate-500">
              <Inbox size={36} strokeWidth={1.5} className="text-sky-200" />
              <span className="text-sm">Chưa có món nào được bán</span>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500">
                    <th className="pb-2 font-medium">STT</th>
                    <th className="pb-2 font-medium">Top 10 món bán chạy</th>
                    <th className="pb-2 text-right font-medium">Số lượng bán</th>
                    <th className="pb-2 text-right font-medium">Doanh thu thuần</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((d, i) => (
                    <tr key={d.name} className="border-t border-slate-50">
                      <td className="py-2 text-slate-500">{pageStart + i + 1}</td>
                      <td className="py-2 text-slate-700">{d.name}</td>
                      <td className="py-2 text-right text-slate-700">{d.qty}</td>
                      <td className="py-2 text-right text-slate-700">{d.revenue.toLocaleString("vi-VN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3 flex items-center justify-center gap-3 text-sm text-slate-500">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, topDishes.length)} trong {topDishes.length}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}