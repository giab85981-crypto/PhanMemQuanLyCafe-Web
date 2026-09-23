import { Bell, HelpCircle, Settings, User, ChevronDown, Store, CreditCard } from "lucide-react";

const NAV_ITEMS = [
  "Tổng quan",
  "Thực đơn",
  "Kho hàng",
  "Phòng/Bàn",
  "Đơn hàng",
  "Khách hàng",
  "Nhân viên",
  "Sổ quỹ",
  "Báo cáo",
];

export default function Navbar({ active = "Tổng quan", onNavigate }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-2.5">
      {/* Logo */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-400">
          <div className="h-3 w-3 rounded-full bg-white" />
        </div>
        <span className="text-lg font-semibold text-slate-800">CafeManager</span>
      </div>

      {/* Primary nav */}
      <nav className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item === active;
          return (
            <button
              key={item}
              onClick={() => onNavigate?.(item)}
              className={`shrink-0 border-b-2 pb-2 pt-2 text-[15px] font-medium transition-colors ${
                isActive
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {item}
            </button>
          );
        })}
        <button className="flex shrink-0 items-center gap-0.5 pb-2 pt-2 text-[15px] font-medium text-slate-600 hover:text-slate-900">
          Khác <ChevronDown size={16} />
        </button>
      </nav>

      {/* Right-side actions */}
      <div className="flex shrink-0 items-center gap-2.5">
        <button className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:flex">
          <Store size={15} className="text-sky-500" />
          Chi nhánh trung tâm
        </button>
        <button className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 md:flex">
          <CreditCard size={15} className="text-sky-500" />
          Thu ngân
          <ChevronDown size={14} />
        </button>

        <IconButton icon={<Bell size={18} />} dot />
        <IconButton icon={<HelpCircle size={18} />} />
        <IconButton icon={<Settings size={18} />} />
        <IconButton icon={<User size={18} />} />
      </div>
    </header>
  );
}

function IconButton({ icon, dot }) {
  return (
    <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
      {icon}
      {dot && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />}
    </button>
  );
}