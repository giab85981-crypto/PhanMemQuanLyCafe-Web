import { Inbox, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const CANCEL_REASONS = [
  { color: "bg-rose-500", label: "Hủy sau báo bếp", qty: 0 },
  { color: "bg-orange-500", label: "Hủy sau tạm tính", qty: 0 },
  { color: "bg-amber-400", label: "Hủy khi kiểm đồ", qty: 0 },
];

const ATTENDANCE = [
  { label: "Nhân viên đi làm", value: 7 },
  { label: "Nhân viên nghỉ làm", value: 0 },
  { label: "Yêu cầu chờ duyệt", value: 1 },
  { label: "Nhân viên đi muộn", value: 1 },
  { label: "Nhân viên về sớm", value: 1 },
  { label: "Nhân viên làm thêm", value: 2 },
];

/** topStaff: [{ name, hours }] */
export default function OperationsSummary({
  cancelledDishes = 0,
  cancelledInvoices = 0,
  topStaff = [],
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Cancelled dishes */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium text-slate-700">Tình trạng hủy món</span>
          <select className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
          </select>
        </div>

        <div className="mt-4 flex gap-10">
          <div>
            <div className="text-sm text-slate-500">Món bị hủy</div>
            <div className="text-2xl font-semibold text-slate-800">{cancelledDishes}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Hóa đơn bị hủy</div>
            <div className="text-2xl font-semibold text-slate-800">{cancelledInvoices}</div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {CANCEL_REASONS.map((r) => (
            <CancelReasonRow key={r.label} {...r} />
          ))}
        </div>
      </div>

      {/* Employee tracking */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-medium text-slate-700">Theo dõi nhân viên</span>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-600">
              Dữ liệu mẫu
            </span>
          </div>
          <select className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
          </select>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-y-4 rounded-lg border border-slate-100 py-3">
          {ATTENDANCE.map((a) => (
            <div key={a.label} className="text-center">
              <div className="text-xs text-slate-500">{a.label}</div>
              <div className="mt-1 text-lg font-semibold text-slate-800">{a.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>STT · Top 5 nhân viên làm nhiều giờ nhất</span>
            <span>Số giờ làm</span>
          </div>
          <div className="mt-2 divide-y divide-slate-50">
            {topStaff.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-600">
                  {i + 1}&ensp;{s.name}
                </span>
                <span className="font-medium text-slate-700">{s.hours}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Quản lý chấm công - tính lương của cửa hàng{" "}
          <a href="#" className="text-sky-600 hover:underline">
            tại đây
          </a>
        </p>
      </div>
    </div>
  );
}

function CancelReasonRow({ color, label, qty }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
        <span className="w-32 shrink-0 text-sm text-slate-600">{label}</span>
        <span className="h-1.5 flex-1 rounded-full bg-slate-100" />
        <span className="w-14 shrink-0 text-right text-sm text-slate-600">{qty} Món</span>
        {open ? (
          <ChevronUp size={16} className="text-slate-500" />
        ) : (
          <ChevronDown size={16} className="text-slate-500" />
        )}
      </button>
      {open && qty === 0 && (
        <div className="mt-3 flex flex-col items-center gap-2 py-6 text-slate-500">
          <Inbox size={36} strokeWidth={1.5} className="text-sky-200" />
          <span className="text-sm">Chưa có món nào bị huỷ</span>
        </div>
      )}
    </div>
  );
}