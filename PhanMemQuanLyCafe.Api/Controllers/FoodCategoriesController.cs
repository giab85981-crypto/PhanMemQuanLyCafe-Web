using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhanMemQuanLyCafe.Api.Data;
using PhanMemQuanLyCafe.Api.Models;

namespace PhanMemQuanLyCafe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FoodCategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public FoodCategoriesController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FoodCategory>>> GetCategories()
            => await _context.FoodCategories.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<FoodCategory>> GetCategory(int id)
        {
            var category = await _context.FoodCategories.FindAsync(id);
            if (category == null) return NotFound();
            return category;
        }

        [HttpPost]
        public async Task<ActionResult<FoodCategory>> CreateCategory(FoodCategory category)
        {
            _context.FoodCategories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, FoodCategory category)
        {
            if (id != category.Id) return BadRequest();
            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.FoodCategories.FindAsync(id);
            if (category == null) return NotFound();
            _context.FoodCategories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}