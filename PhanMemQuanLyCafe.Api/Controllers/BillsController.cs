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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bill>>> GetBills()
            => await _context.Bills.Include(b => b.BillInfos).ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Bill>> GetBill(int id)
        {
            var bill = await _context.Bills
                .Include(b => b.BillInfos)
                .FirstOrDefaultAsync(b => b.Id == id);
            if (bill == null) return NotFound();
            return bill;
        }

        [HttpPost]
        public async Task<ActionResult<Bill>> CreateBill(Bill bill)
        {
            _context.Bills.Add(bill);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBill), new { id = bill.Id }, bill);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBill(int id, Bill bill)
        {
            if (id != bill.Id) return BadRequest();
            _context.Entry(bill).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBill(int id)
        {
            var bill = await _context.Bills.FindAsync(id);
            if (bill == null) return NotFound();
            _context.Bills.Remove(bill);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}