using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PhanMemQuanLyCafe.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PhanMemQuanLyCafe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AccountsController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // Danh sách tài khoản - chỉ Admin xem được
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Account>>> GetAccounts()
            => await _context.Accounts.ToListAsync();

        // Xem thông tin CHÍNH MÌNH
        [HttpGet("{userName}")]
        [Authorize]
        public async Task<ActionResult<Account>> GetAccount(string userName)
        {
            var account = await _context.Accounts.FindAsync(userName);
            if (account == null) return NotFound();
            return account;
        }

        // Đăng nhập - Tạo JWT Token
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrEmpty(request.PassWord))
                    return BadRequest("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");

                string hashedPassword = ComputeMd5Hash(request.PassWord);

                // 1. Kiểm tra tài khoản
                var account = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.UserName == request.UserName && a.PassWord == hashedPassword);

                if (account == null)
                    return Unauthorized("Sai tài khoản hoặc mật khẩu");

                // 2. Xác định Role an toàn (Không cần gọi _context.Roles để tránh lỗi sai tên DbSet)
                int currentRoleId = account.IdRole ?? 2;
                string role = currentRoleId switch
                {
                    1 => "Admin",
                    3 => "Kitchen",
                    _ => "NhanVien"
                };

                // 3. Tạo JWT Claims
                var claims = new[]
                {
            new Claim(ClaimTypes.Name, account.UserName),
            new Claim(ClaimTypes.Role, role),
            new Claim("DisplayName", account.DisplayName ?? account.UserName)
        };

                var jwtKey = _config["Jwt:Key"] ?? "SuperSecretKeyForCafeManagementSystem2026";
                var jwtIssuer = _config["Jwt:Issuer"] ?? "PhanMemQuanLyCafe.Api";
                var jwtAudience = _config["Jwt:Audience"] ?? "PhanMemQuanLyCafe.Client";

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires: DateTime.Now.AddHours(8),
                    signingCredentials: creds
                );

                // 4. Trả về kết quả thành công (200 OK)
                return Ok(new LoginResponse
                {
                    Token = new JwtSecurityTokenHandler().WriteToken(token),
                    UserName = account.UserName,
                    DisplayName = account.DisplayName ?? account.UserName,
                    IdRole = currentRoleId,
                    Type = currentRoleId, // Giữ tương thích Frontend cũ
                    Role = role
                });
            }
            catch (Exception ex)
            {
                // Trả trực tiếp thông báo lỗi về Browser thay vì báo lỗi 500 chung chung
                return StatusCode(500, new
                {
                    message = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        // Tạo tài khoản mới - chỉ Admin được tạo
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Account>> CreateAccount(Account account)
        {
            if (string.IsNullOrWhiteSpace(account.PassWord))
                return BadRequest("Mật khẩu không được để trống");

            var exists = await _context.Accounts.AnyAsync(a => a.UserName == account.UserName);
            if (exists) return Conflict("Tên đăng nhập đã tồn tại");

            account.PassWord = ComputeMd5Hash(account.PassWord);

            // Nếu không truyền IdRole thì mặc định là 2 (Nhân viên)
            if (account.IdRole <= 0) account.IdRole = 2;

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAccount), new { userName = account.UserName }, account);
        }

        // Sửa DisplayName / IdRole
        [HttpPut("{userName}")]
        [Authorize]
        public async Task<IActionResult> UpdateAccount(string userName, UpdateAccountRequest request)
        {
            var currentUser = User.Identity?.Name;
            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin && currentUser != userName)
            {
                return Forbid();
            }

            var account = await _context.Accounts.FindAsync(userName);
            if (account == null) return NotFound();

            account.DisplayName = request.DisplayName;

            // Chỉ Admin mới được thay đổi IdRole
            if (isAdmin)
            {
                int newRole = request.IdRole > 0 ? request.IdRole : request.Type;
                if (newRole > 0) account.IdRole = newRole;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Đổi mật khẩu CHÍNH MÌNH
        [HttpPut("{userName}/change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(string userName, ChangePasswordRequest request)
        {
            if (User.Identity?.Name != userName) return Forbid();

            var account = await _context.Accounts.FindAsync(userName);
            if (account == null) return NotFound();

            string oldHashed = ComputeMd5Hash(request.OldPassword);
            if (account.PassWord != oldHashed)
                return BadRequest("Mật khẩu cũ không đúng");

            if (string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest("Mật khẩu mới không được để trống");

            account.PassWord = ComputeMd5Hash(request.NewPassword);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Admin Reset mật khẩu
        [HttpPut("{userName}/reset-password")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResetPassword(string userName, ResetPasswordRequest request)
        {
            var account = await _context.Accounts.FindAsync(userName);
            if (account == null) return NotFound();

            if (string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest("Mật khẩu mới không được để trống");

            account.PassWord = ComputeMd5Hash(request.NewPassword);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Xóa tài khoản
        [HttpDelete("{userName}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAccount(string userName)
        {
            var account = await _context.Accounts.FindAsync(userName);
            if (account == null) return NotFound();
            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static string ComputeMd5Hash(string input)
        {
            using var md5 = System.Security.Cryptography.MD5.Create();
            byte[] bytes = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
            var sb = new System.Text.StringBuilder();
            foreach (var b in bytes) sb.Append(b.ToString("x2"));
            return sb.ToString();
        }
    }

    public class LoginRequest
    {
        public string UserName { get; set; } = null!;
        public string PassWord { get; set; } = null!;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public int IdRole { get; set; }
        public int Type { get; set; } // Giữ lại Type cho Frontend cũ tương thích
        public string Role { get; set; } = null!;
    }

    public class UpdateAccountRequest
    {
        public string DisplayName { get; set; } = null!;
        public int IdRole { get; set; }
        public int Type { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }

    public class ResetPasswordRequest
    {
        public string NewPassword { get; set; } = null!;
    }
}