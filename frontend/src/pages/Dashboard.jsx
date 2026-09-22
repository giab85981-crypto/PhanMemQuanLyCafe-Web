import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, Utensils, Users, 
  Bell, User, ChevronDown, Clock, AlertTriangle 
} from 'lucide-react';

// 1. Dữ liệu mẫu Biểu đồ Doanh thu (7 ngày qua)
const revenueData = [
  { day: 'T2', doanhThu: 1200000 },
  { day: 'T3', doanhThu: 1850000 },
  { day: 'T4', doanhThu: 1500000 },
  { day: 'T5', doanhThu: 2100000 },
  { day: 'T6', doanhThu: 3400000 },
  { day: 'T7', doanhThu: 4800000 },
  { day: 'CN', doanhThu: 5200000 },
];

// 2. Dữ liệu mẫu Biểu đồ Nhóm món bán chạy
const categoryData = [
  { name: 'Cà phê', value: 45, color: '#0088FE' },
  { name: 'Trà sữa', value: 25, color: '#00C49F' },
  { name: 'Đồ ăn vặt', value: 20, color: '#FFBB28' },
  { name: 'Nước ép', value: 10, color: '#FF8042' },
];

// 3. Dữ liệu mẫu Top món bán chạy
const topFoods = [
  { stt: 1, name: 'Cà phê sữa đá', quantity: 124, total: '3.720.000 đ' },
  { stt: 2, name: 'Bạc xỉu', quantity: 86, total: '2.580.000 đ' },
  { stt: 3, name: 'Trà đào cam sả', quantity: 65, total: '2.275.000 đ' },
  { stt: 4, name: 'Trà sữa Oolong', quantity: 52, total: '2.080.000 đ' },
  { stt: 5, name: 'Bánh mì que', quantity: 40, total: '800.000 đ' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f0f4f8] text-gray-800 font-sans pb-10">
      {/* HEADER NAVBAR */}
      <header className="bg-[#1b75d0] text-white px-6 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 font-bold text-xl">
            <span className="bg-white text-[#1b75d0] px-2 py-0.5 rounded text-base">☕</span>
            <span>KiotCafe</span>
          </div>
          <nav className="hidden md:flex space-x-1 text-sm font-medium">
            <button className="bg-white/20 px-3 py-1.5 rounded font-semibold">Tổng quan</button>
            <button className="hover:bg-white/10 px-3 py-1.5 rounded transition">Thực đơn</button>
            <button className="hover:bg-white/10 px-3 py-1.5 rounded transition">Phòng/Bàn</button>
            <button className="hover:bg-white/10 px-3 py-1.5 rounded transition">Đơn hàng</button>
            <button className="hover:bg-white/10 px-3 py-1.5 rounded transition">Nhân viên</button>
            <button className="hover:bg-white/10 px-3 py-1.5 rounded transition">Báo cáo</button>
          </nav>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="bg-white/10 px-3 py-1 rounded-full text-xs">Chi nhánh trung tâm</span>
          <button className="bg-emerald-500 hover:bg-emerald-600 px-3.5 py-1.5 rounded font-semibold text-xs flex items-center gap-1.5 shadow">
            🛒 Thu ngân
          </button>
          <Bell className="w-5 h-5 cursor-pointer opacity-80 hover:opacity-100" />
          <User className="w-5 h-5 cursor-pointer opacity-80 hover:opacity-100" />
        </div>
      </header>

      {/* CONTAINER */}
      <main className="max-w-[1600px] mx-auto px-6 mt-6 space-y-6">

        {/* BỨC TRANH KINH DOANH */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">Bức tranh kinh doanh</h1>
            <select className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs shadow-sm focus:outline-none">
              <option>Tất cả chi nhánh</option>
            </select>
          </div>

          {/* 3 CARD THỐNG KÊ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500">DOANH THU HÔM NAY</p>
                  <h2 className="text-2xl font-extrabold text-gray-900 mt-1">5.200.000 đ</h2>
                  <p className="text-xs text-emerald-600 font-medium mt-1">↑ 15% so với hôm qua</p>
                </div>
                <span className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp className="w-6 h-6" /></span>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>Giảm giá: <b>150.000 đ</b></span>
                <span>Trả hàng: <b>0 đ</b></span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500">SỐ LƯỢNG ĐƠN HÔM NAY</p>
                  <h2 className="text-2xl font-extrabold text-gray-900 mt-1">42 đơn</h2>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Phục vụ tốt</p>
                </div>
                <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><ShoppingBag className="w-6 h-6" /></span>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>Trung bình đơn: <b>123.800 đ</b></span>
                <span>Số khách: <b>85</b></span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-amber-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500">TỶ LỆ PHỦ BÀN</p>
                  <h2 className="text-2xl font-extrabold text-amber-600 mt-1">65%</h2>
                  <p className="text-xs text-gray-500 mt-1">13 / 20 bàn đang sử dụng</p>
                </div>
                <span className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><Utensils className="w-6 h-6" /></span>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>Đơn đang phục vụ: <b>13</b></span>
                <span>Khách đang ngồi: <b>38</b></span>
              </div>
            </div>
          </div>

          {/* BIỂU ĐỒ DOANH THU & HOẠT ĐỘNG */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 text-sm">Doanh thu 7 ngày qua</h3>
                <span className="text-xs text-blue-600 font-medium cursor-pointer">Xem chi tiết</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} đ`, 'Doanh thu']} />
                    <Bar dataKey="doanhThu" fill="#1b75d0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-700 text-sm mb-3">Hoạt động gần đây</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-2 bg-gray-50 rounded border-l-2 border-emerald-500">
                    <p className="font-semibold text-gray-700">Bàn 05 vừa thanh toán</p>
                    <p className="text-gray-400 mt-0.5">185.000 đ • 2 phút trước</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border-l-2 border-blue-500">
                    <p className="font-semibold text-gray-700">Bàn 12 vừa gọi thêm món</p>
                    <p className="text-gray-400 mt-0.5">2 Cà phê sữa • 8 phút trước</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border-l-2 border-amber-500">
                    <p className="font-semibold text-gray-700">Mở bàn 02</p>
                    <p className="text-gray-400 mt-0.5">4 khách • 15 phút trước</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HIỆU QUẢ THỰC ĐƠN */}
        <section className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Hiệu quả thực đơn</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Biểu đồ tròn Nhóm món */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-4">Tỷ trọng nhóm món bán ra</h4>
              <div className="h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bảng Top món bán chạy */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-4">Top 5 món bán chạy nhất</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                    <tr>
                      <th className="py-2 px-3">STT</th>
                      <th className="py-2 px-3">Tên món</th>
                      <th className="py-2 px-3 text-center">Số lượng</th>
                      <th className="py-2 px-3 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topFoods.map((item) => (
                      <tr key={item.stt} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-medium">{item.stt}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">{item.name}</td>
                        <td className="py-2.5 px-3 text-center bg-blue-50 text-blue-700 font-bold rounded">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-700">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}