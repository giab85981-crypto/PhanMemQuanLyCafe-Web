using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhanMemQuanLyCafe.Api.Data;
using PhanMemQuanLyCafe.Api.Models;

namespace PhanMemQuanLyCafe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BillsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public BillsController(ApplicationDbContext context) => _context = context;

        // ================== CÁC API CƠ BẢN (đã có) ==================

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bill>>> GetBills()
            => await _context.Bills.Include(b => b.BillInfos).ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Bill>> GetBill(int id)
        {
            var bill = await _context.Bills
                .Include(b => b.BillInfos)
                .ThenInclude(bi => bi.IdFoodNavigation)
                .FirstOrDefaultAsync(b => b.Id == id);
            if (bill == null) return NotFound();
            return bill;
        }

        // ================== NGHIỆP VỤ: CHECK-IN (mở bàn mới) ==================

        // POST: api/bills/checkin/5  (5 = idTable)
        [HttpPost("checkin/{tableId}")]
        public async Task<ActionResult<Bill>> CheckIn(int tableId)
        {
            var table = await _context.TableFoods.FindAsync(tableId);
            if (table == null) return NotFound("Không tìm thấy bàn");

            if (table.Status != "Trống")
                return BadRequest("Bàn này đang có khách, không thể check-in");

            var bill = new Bill
            {
                IdTable = tableId,
                DateCheckIn = DateTime.Now,
                Status = 0, // chưa thanh toán
                Discount = 0,
                TotalPrice = 0
            };

            _context.Bills.Add(bill);
            table.Status = "Có người";

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBill), new { id = bill.Id }, bill);
        }

        // ================== NGHIỆP VỤ: THÊM MÓN VÀO HÓA ĐƠN ==================

        // POST: api/bills/5/items   Body: { "idFood": 2, "count": 3 }
        [HttpPost("{billId}/items")]
        public async Task<ActionResult> AddItem(int billId, [FromBody] AddItemRequest request)
        {
            var bill = await _context.Bills.FindAsync(billId);
            if (bill == null) return NotFound("Không tìm thấy hóa đơn");
            if (bill.Status == 1) return BadRequest("Hóa đơn đã thanh toán, không thể thêm món");

            var food = await _context.Foods.FindAsync(request.IdFood);
            if (food == null) return NotFound("Không tìm thấy món ăn");

            // Nếu món này đã có trong hóa đơn, cộng dồn số lượng thay vì tạo dòng mới
            var existingItem = await _context.BillInfos
                .FirstOrDefaultAsync(bi => bi.IdBill == billId && bi.IdFood == request.IdFood);

            if (existingItem != null)
            {
                existingItem.Count += request.Count;
            }
            else
            {
                _context.BillInfos.Add(new BillInfo
                {
                    IdBill = billId,
                    IdFood = request.IdFood,
                    Count = request.Count
                });
            }

            await RecalculateTotal(billId);
            await _context.SaveChangesAsync();

            return Ok(await GetBillDetail(billId));
        }

        // DELETE: api/bills/items/10  (10 = id của BillInfo)
        [HttpDelete("items/{billInfoId}")]
        public async Task<ActionResult> RemoveItem(int billInfoId)
        {
            var item = await _context.BillInfos.FindAsync(billInfoId);
            if (item == null) return NotFound();

            int billId = item.IdBill;
            _context.BillInfos.Remove(item);
            await RecalculateTotal(billId);
            await _context.SaveChangesAsync();

            return Ok(await GetBillDetail(billId));
        }

        // ================== NGHIỆP VỤ: THANH TOÁN ==================

        // PUT: api/bills/5/checkout   Body: { "discount": 10 }  (giảm giá %, có thể để 0)
        [HttpPut("{billId}/checkout")]
        public async Task<ActionResult> Checkout(int billId, [FromBody] CheckoutRequest request)
        {
            var bill = await _context.Bills
                .Include(b => b.IdTableNavigation)
                .FirstOrDefaultAsync(b => b.Id == billId);

            if (bill == null) return NotFound("Không tìm thấy hóa đơn");
            if (bill.Status == 1) return BadRequest("Hóa đơn này đã thanh toán rồi");

            bill.Discount = request.Discount;
            await RecalculateTotal(billId, save: false);

            bill.Status = 1; // đã thanh toán
            bill.DateCheckOut = DateTime.Now;

            if (bill.IdTableNavigation != null)
                bill.IdTableNavigation.Status = "Trống"; // trả bàn về trống

            await _context.SaveChangesAsync();
            return Ok(await GetBillDetail(billId));
        }

        // ================== HÀM PHỤ ==================

        private async Task<object> GetBillDetail(int billId)
        {
            var bill = await _context.Bills
                .Include(b => b.BillInfos)
                .ThenInclude(bi => bi.IdFoodNavigation)
                .Include(b => b.IdTableNavigation)
                .FirstOrDefaultAsync(b => b.Id == billId);
            return bill!;
        }

        // Tính lại tổng tiền dựa trên các món trong hóa đơn + phần trăm giảm giá
        private async Task RecalculateTotal(int billId, bool save = true)
        {
            var bill = await _context.Bills
                .Include(b => b.BillInfos)
                .ThenInclude(bi => bi.IdFoodNavigation)
                .FirstOrDefaultAsync(b => b.Id == billId);

            if (bill == null) return;

            double subTotal = bill.BillInfos.Sum(bi => bi.Count * (bi.IdFoodNavigation?.Price ?? 0));
            double discountAmount = subTotal * (bill.Discount ?? 0) / 100.0;
            bill.TotalPrice = subTotal - discountAmount;

            if (save) await _context.SaveChangesAsync();
        }
    }

    public class AddItemRequest
    {
        public int IdFood { get; set; }
        public int Count { get; set; } = 1;
    }

    public class CheckoutRequest
    {
        public int Discount { get; set; } = 0; // phần trăm giảm giá, 0-100
    }
}