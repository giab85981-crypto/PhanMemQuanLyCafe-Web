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
    [Authorize] // Yêu cầu đăng nhập để xem danh mục
    public class FoodCategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FoodCategoriesController(ApplicationDbContext context) => _context = context;

        // GET: api/foodcategories (Tất cả nhân viên & Admin đều xem được)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FoodCategory>>> GetCategories()
            => await _context.FoodCategories.ToListAsync();

        // GET: api/foodcategories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FoodCategory>> GetCategory(int id)
        {
            var category = await _context.FoodCategories.FindAsync(id);
            if (category == null) return NotFound("Không tìm thấy danh mục");
            return category;
        }

        // POST: api/foodcategories (Chỉ Admin)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FoodCategory>> CreateCategory([FromBody] CategoryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Tên danh mục không được để trống");

            var category = new FoodCategory { Name = request.Name };

            _context.FoodCategories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        // PUT: api/foodcategories/5 (Chỉ Admin)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryRequest request)
        {
            var category = await _context.FoodCategories.FindAsync(id);
            if (category == null) return NotFound("Không tìm thấy danh mục");

            category.Name = request.Name;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/foodcategories/5 (Chỉ Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.FoodCategories.FindAsync(id);
            if (category == null) return NotFound("Không tìm thấy danh mục");

            // Sử dụng Stored Procedure USP_DeleteCategory để xóa an toàn cả món và billinfo liên quan
            var param = new SqlParameter("@id", id);
            await _context.Database.ExecuteSqlRawAsync("EXEC USP_DeleteCategory @id", param);

            return NoContent();
        }
    }

    public class CategoryRequest
    {
        public string Name { get; set; } = null!;
    }
}