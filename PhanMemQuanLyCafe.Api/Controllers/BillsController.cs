using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhanMemQuanLyCafe.Api.Data;
using PhanMemQuanLyCafe.Api.Models;

namespace PhanMemQuanLyCafe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BillsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BillsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/bills (Danh sách tất cả hóa đơn)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BillDto>>> GetBills()
        {
            var bills = await _context.Bills
                .Include(b => b.IdTableNavigation)
                .Include(b => b.BillInfos)
                .ThenInclude(bi => bi.IdFoodNavigation)
                .OrderByDescending(b => b.DateCheckIn)
                .Select(b => MapToBillDto(b))
                .ToListAsync();

            return Ok(bills);
        }

        // GET: api/bills/active-table/5 (Lấy hóa đơn CHƯA thanh toán của 1 bàn)
        [HttpGet("active-table/{tableId}")]
        public async Task<ActionResult<BillDto>> GetActiveBillByTable(int tableId)
        {
            var bill = await _context.Bills
                .Include(b => b.IdTableNavigation)
                .Include(b => b.BillInfos)
                .ThenInclude(bi => bi.IdFoodNavigation)
                .FirstOrDefaultAsync(b => b.IdTable == tableId && b.Status == 0);

            if (bill == null) return NotFound("Bàn này hiện tại không có hóa đơn chưa thanh toán");

            return Ok(MapToBillDto(bill));
        }

        // GET: api/bills/5 (Xem chi tiết 1 hóa đơn cụ thể)
        [HttpGet("{id}")]
        public async Task<ActionResult<BillDto>> GetBill(int id)
        {
            var bill = await _context.Bills
                .Include(b => b.IdTableNavigation)
                .Include(b => b.BillInfos)
                .ThenInclude(bi => bi.IdFoodNavigation)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (bill == null) return NotFound("Không tìm thấy hóa đơn");

            return Ok(MapToBillDto(bill));
        }

        // POST: api/bills/add-food (Thêm món vào bàn - Tự động tạo Bill nếu chưa có)
        [HttpPost("add-food")]
        public async Task<ActionResult<BillDto>> AddFoodToTable([FromBody] AddFoodToTableRequest request)
        {
            var table = await _context.TableFoods.FindAsync(request.TableId);
            if (table == null) return NotFound("Không tìm thấy bàn");

            var food = await _context.Foods.FindAsync(request.FoodId);
            if (food == null) return NotFound("Không tìm thấy món ăn");

            if (request.Count <= 0) return BadRequest("Số lượng món phải lớn hơn 0");

            // 1. Tìm hóa đơn chưa thanh toán của bàn
            var bill = await _context.Bills
                .Include(b => b.BillInfos)
                .FirstOrDefaultAsync(b => b.IdTable == request.TableId && b.Status == 0);

            // 2. Nếu bàn chưa có bill -> Tự động check-in mở bill mới
            if (bill == null)
            {
                bill = new Bill
                {
                    IdTable = request.TableId,
                    DateCheckIn = DateTime.Now,
                    Status = 0,
                    Discount = 0,
                    TotalPrice = 0
                };
                _context.Bills.Add(bill);
                table.Status = "Có người";
                await _context.SaveChangesAsync();
            }

            // 3. Thêm hoặc cộng dồn số lượng món vào BillInfo
            var existingItem = bill.BillInfos.FirstOrDefault(bi => bi.IdFood == request.FoodId);
            if (existingItem != null)
            {
                existingItem.Count += request.Count;
            }
            else
            {
                _context.BillInfos.Add(new BillInfo
                {
                    IdBill = bill.Id,
                    IdFood = request.FoodId,
                    Count = request.Count
                });
            }

            await _context.SaveChangesAsync();

            // 4. Tính lại tổng tiền
            await RecalculateTotal(bill.Id);

            return await GetBill(bill.Id);
        }

        // DELETE: api/bills/items/10 (Xóa món khỏi hóa đơn)
        [HttpDelete("items/{billInfoId}")]
        public async Task<ActionResult<BillDto>> RemoveItem(int billInfoId)
        {
            var item = await _context.BillInfos.FindAsync(billInfoId);
            if (item == null) return NotFound("Không tìm thấy dòng món ăn này");

            int billId = item.IdBill;
            _context.BillInfos.Remove(item);
            await _context.SaveChangesAsync();

            // Tính lại tổng tiền sau khi xóa món
            await RecalculateTotal(billId);

            return await GetBill(billId);
        }

        // PUT: api/bills/5/checkout (Thanh toán hóa đơn)
        [HttpPut("{billId}/checkout")]
        public async Task<ActionResult<BillDto>> Checkout(int billId, [FromBody] CheckoutRequest request)
        {
            var bill = await _context.Bills
                .Include(b => b.IdTableNavigation)
                .Include(b => b.BillInfos)
                .ThenInclude(bi => bi.IdFoodNavigation)
                .FirstOrDefaultAsync(b => b.Id == billId);

            if (bill == null) return NotFound("Không tìm thấy hóa đơn");
            if (bill.Status == 1) return BadRequest("Hóa đơn này đã được thanh toán trước đó");

            if (request.Discount < 0 || request.Discount > 100)
                return BadRequest("Mức giảm giá không hợp lệ (từ 0% đến 100%)");

            bill.Discount = request.Discount;

            // Tính toán tổng tiền thực tế sau khi áp dụng giảm giá
            double subTotal = bill.BillInfos.Sum(bi => bi.Count * (bi.IdFoodNavigation?.Price ?? 0));
            double discountAmount = subTotal * (bill.Discount ?? 0) / 100.0;
            bill.TotalPrice = subTotal - discountAmount;

            bill.Status = 1; // Đã thanh toán
            bill.DateCheckOut = DateTime.Now;

            // Đổi trạng thái bàn về "Trống"
            if (bill.IdTableNavigation != null)
            {
                bill.IdTableNavigation.Status = "Trống";
            }

            await _context.SaveChangesAsync();

            return Ok(MapToBillDto(bill));
        }

        // ================== HÀM PHỤ BỔ TRỢ ==================

        private async Task RecalculateTotal(int billId)
        {
            var bill = await _context.Bills
                .Include(b => b.BillInfos)
                .ThenInclude(bi => bi.IdFoodNavigation)
                .FirstOrDefaultAsync(b => b.Id == billId);

            if (bill == null) return;

            double subTotal = bill.BillInfos.Sum(bi => bi.Count * (bi.IdFoodNavigation?.Price ?? 0));
            double discountAmount = subTotal * (bill.Discount ?? 0) / 100.0;
            bill.TotalPrice = subTotal - discountAmount;

            await _context.SaveChangesAsync();
        }

        private static BillDto MapToBillDto(Bill bill)
        {
            return new BillDto
            {
                Id = bill.Id,
                TableId = bill.IdTable,
                TableName = bill.IdTableNavigation?.Name,
                DateCheckIn = bill.DateCheckIn,
                DateCheckOut = bill.DateCheckOut,
                Status = bill.Status,
                Discount = bill.Discount ?? 0,
                TotalPrice = bill.TotalPrice,
                Items = bill.BillInfos.Select(bi => new BillItemDto
                {
                    BillInfoId = bi.Id,
                    FoodId = bi.IdFood,
                    FoodName = bi.IdFoodNavigation?.Name ?? "N/A",
                    Price = bi.IdFoodNavigation?.Price ?? 0,
                    Count = bi.Count,
                    Amount = bi.Count * (bi.IdFoodNavigation?.Price ?? 0)
                }).ToList()
            };
        }
    }

    // --- DTOs CHUẨN CHO FRONTEND ---

    public class AddFoodToTableRequest
    {
        public int TableId { get; set; }
        public int FoodId { get; set; }
        public int Count { get; set; } = 1;
    }

    public class CheckoutRequest
    {
        public int Discount { get; set; } = 0;
    }

    public class BillDto
    {
        public int Id { get; set; }
        public int TableId { get; set; }
        public string? TableName { get; set; }
        public DateTime DateCheckIn { get; set; }
        public DateTime? DateCheckOut { get; set; }
        public int Status { get; set; }
        public int Discount { get; set; }
        public double TotalPrice { get; set; }
        public List<BillItemDto> Items { get; set; } = new();
    }

    public class BillItemDto
    {
        public int BillInfoId { get; set; }
        public int FoodId { get; set; }
        public string FoodName { get; set; } = null!;
        public double Price { get; set; }
        public int Count { get; set; }
        public double Amount { get; set; }
    }
}