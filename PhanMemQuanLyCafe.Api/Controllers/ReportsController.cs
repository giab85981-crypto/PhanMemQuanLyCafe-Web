using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PhanMemQuanLyCafe.Api.Data;

namespace PhanMemQuanLyCafe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Chỉ tài khoản Admin mới xem được báo cáo doanh thu
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/reports/revenue?fromDate=2026-01-01&toDate=2026-12-31
        [HttpGet("revenue")]
        public async Task<ActionResult<IEnumerable<RevenueReportDto>>> GetRevenueReport(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            var paramFrom = new SqlParameter("@fromDate", fromDate.ToString("yyyy-MM-dd"));
            var paramTo = new SqlParameter("@toDate", toDate.ToString("yyyy-MM-dd"));

            // Gọi Stored Procedure và map kết quả vào RevenueReportDto
            var reportData = await _context.Database
                .SqlQueryRaw<RevenueReportDto>("EXEC USP_GetBillByDateRange @fromDate, @toDate", paramFrom, paramTo)
                .ToListAsync();

            return Ok(reportData);
        }
    }

    public class RevenueReportDto
    {
        public int IDBill { get; set; }
        public string TenBan { get; set; } = null!;
        public double TongTien { get; set; }
        public DateTime NgayVao { get; set; }
        public DateTime? NgayRa { get; set; }
        public int GiamGia { get; set; }
    }
}