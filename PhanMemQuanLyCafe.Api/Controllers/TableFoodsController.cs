using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhanMemQuanLyCafe.Api.Data;
using PhanMemQuanLyCafe.Api.Models;

namespace PhanMemQuanLyCafe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TableFoodsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public TableFoodsController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TableFood>>> GetTables()
            => await _context.TableFoods.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<TableFood>> GetTable(int id)
        {
            var table = await _context.TableFoods.FindAsync(id);
            if (table == null) return NotFound();
            return table;
        }

        [HttpPost]
        public async Task<ActionResult<TableFood>> CreateTable(TableFood table)
        {
            _context.TableFoods.Add(table);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTable), new { id = table.Id }, table);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTable(int id, TableFood table)
        {
            if (id != table.Id) return BadRequest();
            _context.Entry(table).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTable(int id)
        {
            var table = await _context.TableFoods.FindAsync(id);
            if (table == null) return NotFound();
            _context.TableFoods.Remove(table);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}