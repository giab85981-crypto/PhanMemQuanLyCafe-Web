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
    [Authorize]
    public class FoodsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FoodsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/foods (Lấy danh sách món ăn kèm tên danh mục)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FoodDto>>> GetFoods()
        {
            return await _context.Foods
                .Select(f => new FoodDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Price = f.Price,
                    CategoryId = f.IdCategory,
                    CategoryName = f.IdCategoryNavigation.Name
                })
                .ToListAsync();
        }

        // GET: api/foods/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FoodDto>> GetFood(int id)
        {
            var food = await _context.Foods
                .Where(f => f.Id == id)
                .Select(f => new FoodDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Price = f.Price,
                    CategoryId = f.IdCategory,
                    CategoryName = f.IdCategoryNavigation.Name
                })
                .FirstOrDefaultAsync();

            if (food == null) return NotFound("Không tìm thấy món ăn");
            return food;
        }

        // GET: api/foods/by-category/2 (Lọc danh sách món theo ID Danh mục)
        [HttpGet("by-category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<FoodDto>>> GetFoodsByCategory(int categoryId)
        {
            return await _context.Foods
                .Where(f => f.IdCategory == categoryId)
                .Select(f => new FoodDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Price = f.Price,
                    CategoryId = f.IdCategory,
                    CategoryName = f.IdCategoryNavigation.Name
                })
                .ToListAsync();
        }

        // GET: api/foods/search?name=ca fe (Tìm kiếm món hỗ trợ gõ không dấu)
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<FoodDto>>> SearchFood([FromQuery] string name)
        {
            var param = new SqlParameter("@name", name ?? "");

            var searchResults = await _context.Database
                .SqlQueryRaw<SearchFoodResultDto>("EXEC USP_SearchFoodByName @name", param)
                .ToListAsync();

            return Ok(searchResults);
        }

        // POST: api/foods (Chỉ Admin)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FoodDto>> CreateFood([FromBody] SaveFoodRequest request)
        {
            var categoryExists = await _context.FoodCategories.AnyAsync(c => c.Id == request.CategoryId);
            if (!categoryExists) return BadRequest("Danh mục không tồn tại");

            var food = new Food
            {
                Name = request.Name,
                IdCategory = request.CategoryId,
                Price = request.Price
            };

            _context.Foods.Add(food);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFood), new { id = food.Id }, new FoodDto
            {
                Id = food.Id,
                Name = food.Name,
                Price = food.Price,
                CategoryId = food.IdCategory
            });
        }

        // PUT: api/foods/5 (Chỉ Admin)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateFood(int id, [FromBody] SaveFoodRequest request)
        {
            var food = await _context.Foods.FindAsync(id);
            if (food == null) return NotFound("Không tìm thấy món ăn");

            var categoryExists = await _context.FoodCategories.AnyAsync(c => c.Id == request.CategoryId);
            if (!categoryExists) return BadRequest("Danh mục không tồn tại");

            food.Name = request.Name;
            food.IdCategory = request.CategoryId;
            food.Price = request.Price;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/foods/5 (Chỉ Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteFood(int id)
        {
            var food = await _context.Foods.FindAsync(id);
            if (food == null) return NotFound("Không tìm thấy món ăn");

            // Gọi Stored Procedure USP_DeleteFood để tự động xóa các BillInfo liên quan trước
            var param = new SqlParameter("@id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC USP_DeleteFood @id", param);

            return NoContent();
        }
    }

    // --- DTOs ---

    public class FoodDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public double Price { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
    }

    public class SearchFoodResultDto
    {
        public int ID { get; set; }
        public string Name { get; set; } = null!;
        public int CategoryID { get; set; }
        public double Price { get; set; }
    }

    public class SaveFoodRequest
    {
        public string Name { get; set; } = null!;
        public int CategoryId { get; set; }
        public double Price { get; set; }
    }
}