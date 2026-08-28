using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PhanMemQuanLyCafe.Api.Data;
using PhanMemQuanLyCafe.Api.Models;

namespace PhanMemQuanLyCafe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu người dùng phải đăng nhập mới sử dụng được API Bàn
    public class TableFoodsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TableFoodsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/tablefoods (Cả Admin và Nhân viên đều xem được)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TableFood>>> GetTables()
        {
            return await _context.TableFoods.ToListAsync();
        }

        // GET: api/tablefoods/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TableFood>> GetTable(int id)
        {
            var table = await _context.TableFoods.FindAsync(id);
            if (table == null) return NotFound("Không tìm thấy bàn");

            return table;
        }

        // POST: api/tablefoods (Chỉ Admin mới được thêm bàn mới)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TableFood>> CreateTable([FromBody] CreateTableRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Tên bàn không được để trống");

            var table = new TableFood
            {
                Name = request.Name,
                Status = "Trống" // Mặc định bàn mới tạo luôn là Trống
            };

            _context.TableFoods.Add(table);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTable), new { id = table.Id }, table);
        }

        // PUT: api/tablefoods/5 (Chỉ Admin mới được đổi tên/trạng thái bàn)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTable(int id, [FromBody] UpdateTableRequest request)
        {
            var table = await _context.TableFoods.FindAsync(id);
            if (table == null) return NotFound("Không tìm thấy bàn");

            table.Name = request.Name;
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                table.Status = request.Status;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/tablefoods/5 (Chỉ Admin mới được xóa bàn)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTable(int id)
        {
            var table = await _context.TableFoods.FindAsync(id);
            if (table == null) return NotFound("Không tìm thấy bàn");

            // Ràng buộc nghiệp vụ: Không cho phép xóa bàn đang có khách ngồi
            if (table.Status == "Có người")
                return BadRequest("Không thể xóa bàn đang có khách ngồi");

            // Sử dụng Stored Procedure USP_DeleteTable có sẵn trong DB để dọn dẹp Bill/BillInfo trước khi xóa
            var param = new SqlParameter("@id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC USP_DeleteTable @id", param);

            return NoContent();
        }

        // POST: api/tablefoods/switch (Chuyển bàn - Cả Admin và Nhân viên đều dùng được)
        [HttpPost("switch")]
        public async Task<IActionResult> SwitchTable([FromBody] SwitchTableRequest request)
        {
            if (request.TableId1 == request.TableId2)
                return BadRequest("Bàn chuyển và bàn đến không được trùng nhau");

            var param1 = new SqlParameter("@idTable1", request.TableId1);
            var param2 = new SqlParameter("@idTable2", request.TableId2);

            // Gọi Stored Procedure hoán đổi hóa đơn giữa 2 bàn
            await _context.Database.ExecuteSqlRawAsync("EXEC USP_SwitchTable @idTable1, @idTable2", param1, param2);

            return Ok(new { message = "Chuyển bàn thành công" });
        }
    }

    // --- DTOs để nhận dữ liệu từ Frontend ---

    public class CreateTableRequest
    {
        public string Name { get; set; } = null!;
    }

    public class UpdateTableRequest
    {
        public string Name { get; set; } = null!;
        public string? Status { get; set; }
    }

    public class SwitchTableRequest
    {
        public int TableId1 { get; set; }
        public int TableId2 { get; set; }
    }
}