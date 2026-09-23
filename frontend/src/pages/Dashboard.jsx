import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import StatCard from "./StatCard";
import TrendChart from "./TrendChart";
import PromoSidebar from "./PromoSidebar";
import MenuEfficiency from "./MenuEfficiency";
import OperationsSummary from "./OperationsSummary";

// Placeholder chart data shaped like `{ label, value }[]`.
// Replace with data from your ASP.NET Core API, e.g.:
//   fetch("/api/dashboard/revenue?range=7d").then(r => r.json())
const EMPTY_HOURLY = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 8}h`, value: 0 }));

export default function Dashboard() {
  const [summary, setSummary] = useState({
    revenueToday: 0,
    ordersToday: 0,
    tableUsageRate: 0,
    tablesInUse: 0,
    totalTables: 1,
    ordersInProgress: 0,
    customersInProgress: 0,
    invoiceDiscount: 0,
    returns: 0,
    avgOrderValue: 0,
    customersPerOrder: 0,
  });
  const [revenueSeries, setRevenueSeries] = useState(EMPTY_HOURLY);
  const [customerSeries, setCustomerSeries] = useState(EMPTY_HOURLY);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [menuGroups, setMenuGroups] = useState([]);
  const [topDishes, setTopDishes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example wiring to your backend — adjust the endpoint/DTO to match your API.
    // fetch("/api/dashboard/summary")
    //   .then((res) => res.json())
    //   .then((data) => {
    //     setSummary(data.summary);
    //     setRevenueSeries(data.revenueSeries);
    //     setCustomerSeries(data.customerSeries);
    //     setInvoiceCount(data.invoiceCount);
    //     setCustomerCount(data.customerCount);
    //     setMenuGroups(data.menuGroups);
    //     setTopDishes(data.topDishes);
    //     setActivities(data.activities);
    //   })
    //   .finally(() => setLoading(false));
    setLoading(false);
  }, []);

  const revenueTotal = revenueSeries.reduce((sum, d) => sum + d.value, 0);
  const customerTotal = customerSeries.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header/Navbar đã được render chung trong App.jsx, Dashboard chỉ cần phần nội dung */}
      <main className="mx-auto max-w-[1920px] px-6 py-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Bức tranh kinh doanh</h1>
          <button className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600 shadow-sm">
            Tất cả chi nhánh <ChevronDown size={15} />
          </button>
        </div>

        {/* Cột trái (thẻ số liệu + 2 biểu đồ) và PromoSidebar bên phải chạy dọc ngang bằng cả 2 hàng đó */}
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard
                tone="blue"
                title="Doanh thu hôm nay"
                badge="Bao gồm VAT"
                value={summary.revenueToday.toLocaleString("vi-VN")}
                subtitle={summary.revenueToday === 0 ? "Không phát sinh doanh thu" : undefined}
                highlight={summary.revenueToday > 0 ? "Doanh thu mới" : undefined}
                rows={[
                  { label: "Giảm giá hóa đơn", value: summary.invoiceDiscount },
                  { label: `Trả hàng (${summary.returns})`, value: summary.returns },
                ]}
              />
              <StatCard
                tone="green"
                title="Số lượng đơn hôm nay"
                value={summary.ordersToday}
                subtitle={summary.ordersToday === 0 ? "Không phát sinh đơn" : undefined}
                highlight={summary.ordersToday > 0 ? "Đơn mới" : undefined}
                rows={[
                  { label: "Trung bình đơn", value: summary.avgOrderValue.toLocaleString("vi-VN") },
                  { label: "Số khách/đơn", value: summary.customersPerOrder },
                ]}
              />
              <StatCard
                tone="amber"
                title="Tỷ lệ phủ bàn"
                value={`${summary.tableUsageRate}%`}
                subtitle={`${summary.tablesInUse}/${summary.totalTables} bàn đang sử dụng`}
                rows={[
                  { label: `Đơn đang phục vụ (${summary.ordersInProgress})`, value: summary.ordersInProgress },
                  { label: "Khách đang phục vụ", value: summary.customersInProgress },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TrendChart
                title="Doanh thu thuần"
                infoTooltip="Doanh thu sau khi trừ giảm giá và trả hàng"
                summaryValue={revenueTotal.toLocaleString("vi-VN")}
                summaryDetail={`(${invoiceCount} hóa đơn)`}
                emptyState="Bạn chưa bán đơn nào"
                data={revenueSeries}
                type="bar"
                formatAxis="currency"
              />
              <TrendChart
                title="Lượng khách hàng"
                summaryValue={customerTotal}
                summaryDetail="lượt khách"
                emptyState="Chưa có lượt khách nào"
                data={customerSeries}
                type="line"
                formatAxis="number"
              />
            </div>
          </div>

          <PromoSidebar activities={activities} />
        </div>

        <div className="mt-4">
          <MenuEfficiency groups={menuGroups} topDishes={topDishes} />
        </div>

        <div className="mt-4">
          <OperationsSummary
            cancelledDishes={0}
            cancelledInvoices={0}
            topStaff={[
              { name: "Lê Thị Bảo Trân", hours: "9 giờ 30 phút" },
              { name: "Nguyễn Thị Hồng Thảo Vân", hours: "7 giờ 45 phút" },
              { name: "Nguyễn Minh Loan", hours: "6 giờ 33 phút" },
              { name: "Lã Ngọc Anh", hours: "6 giờ 15 phút" },
            ]}
          />
        </div>
      </main>
    </div>
  );
}