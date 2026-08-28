using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhanMemQuanLyCafe.Api.Data;
using PhanMemQuanLyCafe.Api.Models;

namespace PhanMemQuanLyCafe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BillInfosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public BillInfosController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BillInfo>>> GetBillInfos()
            => await _context.BillInfos.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<BillInfo>> GetBillInfo(int id)
        {
            var billInfo = await _context.BillInfos.FindAsync(id);
            if (billInfo == null) return NotFound();
            return billInfo;
        }

        [HttpPost]
        public async Task<ActionResult<BillInfo>> CreateBillInfo(BillInfo billInfo)
        {
            _context.BillInfos.Add(billInfo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBillInfo), new { id = billInfo.Id }, billInfo);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBillInfo(int id, BillInfo billInfo)
        {
            if (id != billInfo.Id) return BadRequest();
            _context.Entry(billInfo).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBillInfo(int id)
        {
            var billInfo = await _context.BillInfos.FindAsync(id);
            if (billInfo == null) return NotFound();
            _context.BillInfos.Remove(billInfo);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}