import { Bike, Wallet, Landmark, ChevronRight, Sparkles, Inbox, ShoppingCart } from "lucide-react";

const LINKS = [
  {
    icon: Bike,
    iconBg: "bg-sky-50 text-sky-500",
    title: "Giao món siêu tốc",
    subtitle: "Grab, Ahamove, XanhSM",
  },
  {
    icon: Wallet,
    iconBg: "bg-rose-50 text-rose-500",
    title: "Thanh toán",
    subtitle: "Cài đặt QR tting ting miễn phí",
  },
  {
    icon: Landmark,
    iconBg: "bg-amber-50 text-amber-500",
    title: "Vay vốn",
    subtitle: "Giải ngân tới 1 tỷ đồng chỉ trong 24H",
  },
];

/**
 * activities: [{ id, actorName, message, timeAgo }]
 *   message is the part after the name, e.g. "vừa bán hàng với giá trị 50,000 tại Chi nhánh trung tâm"
 *   Render your own bold/link spans inside `message` if you want "bán hàng" highlighted like KiotViet.
 */
export default function PromoSidebar({ activities = [] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white shadow-sm">
        {LINKS.map(({ icon: Icon, iconBg, title, subtitle }) => (
          <button
            key={title}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-700">{title}</div>
              <div className="truncate text-xs text-slate-500">{subtitle}</div>
            </span>
            <ChevronRight size={16} className="shrink-0 text-slate-400" />
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-500">
            <Sparkles size={12} /> Mới
          </span>
          <span className="text-sm font-medium text-slate-700">Khuyến mại</span>
        </div>
        <p className="text-sm text-slate-500">
          Dễ dàng tạo các loại khuyến mại phổ biến nhất
        </p>
        <button className="mt-2 flex items-center gap-1 text-sm font-medium text-sky-600 hover:underline">
          Xem ngay <ChevronRight size={14} />
        </button>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-medium text-slate-700">Hoạt động gần đây</div>
        {activities.length > 0 ? (
          <div className="space-y-3.5">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <ShoppingCart size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-slate-600">
                    <span className="font-semibold text-slate-800">{a.actorName}</span> {a.message}
                  </p>
                  <span className="text-xs text-slate-500">{a.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-slate-500">
            <Inbox size={40} strokeWidth={1.5} className="text-sky-200" />
            <span className="text-sm">Chưa có hoạt động nào</span>
          </div>
        )}
      </div>
    </div>
  );
}