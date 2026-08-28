using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhanMemQuanLyCafe.Api.Data;
using PhanMemQuanLyCafe.Api.Models;

namespace PhanMemQuanLyCafe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FoodsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FoodsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/foods
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Food>>> GetFoods()
        {
            return await _context.Foods
                .Include(f => f.IdCategoryNavigation)
                .ToListAsync();
        }

        // GET: api/foods/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Food>> GetFood(int id)
        {
            var food = await _context.Foods.FindAsync(id);
            if (food == null) return NotFound();
            return food;
        }

        // POST: api/foods
        [HttpPost]
        public async Task<ActionResult<Food>> CreateFood(Food food)
        {
            _context.Foods.Add(food);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetFood), new { id = food.Id }, food);
        }

        // PUT: api/foods/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFood(int id, Food food)
        {
            if (id != food.Id) return BadRequest();
            _context.Entry(food).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/foods/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFood(int id)
        {
            var food = await _context.Foods.FindAsync(id);
            if (food == null) return NotFound();
            _context.Foods.Remove(food);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}