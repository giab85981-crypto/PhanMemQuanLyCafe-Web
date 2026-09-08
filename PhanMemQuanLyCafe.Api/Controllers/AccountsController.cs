using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PhanMemQuanLyCafe.Api.Data;
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

        // Danh sách tài khoản - chỉ Admin xem được (dùng cho trang Quản lý tài khoản)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Account>>> GetAccounts()
            => await _context.Accounts.ToListAsync();

        // Ai đăng nhập rồi cũng xem được thông tin CHÍNH MÌNH (dùng cho trang Profile)
        [HttpGet("{userName}")]
        [Authorize]
        public async Task<ActionResult<Account>> GetAccount(string userName)
        {
            var account = await _context.Accounts.FindAsync(userName);
            if (account == null) return NotFound();
            return account;
        }

        // Đăng nhập - KHÔNG yêu cầu Authorize (đây là nơi lấy token)
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            string hashedPassword = ComputeMd5Hash(request.PassWord);

            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.UserName == request.UserName && a.PassWord == hashedPassword);

            if (account == null) return Unauthorized("Sai tài khoản hoặc mật khẩu");

            string role = account.Type == 1 ? "Admin" : "NhanVien";

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, account.UserName),
                new Claim(ClaimTypes.Role, role),
                new Claim("DisplayName", account.DisplayName)
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

            return new LoginResponse
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                UserName = account.UserName,
                DisplayName = account.DisplayName,
                Type = account.Type,
                Role = role
            };
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
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAccount), new { userName = account.UserName }, account);
        }

        // Sửa DisplayName/Type - CHÍNH MÌNH sửa tên hiển thị hoặc ADMIN sửa cho người khác
        [HttpPut("{userName}")]
        [Authorize]
        public async Task<IActionResult> UpdateAccount(string userName, UpdateAccountRequest request)
        {
            var currentUser = User.Identity?.Name;
            var isAdmin = User.IsInRole("Admin");

            // Nhân viên chỉ được sửa chính mình, và không được tự đổi Type (tự nâng quyền)
            if (!isAdmin)
            {
                if (currentUser != userName) return Forbid();
            }

            var account = await _context.Accounts.FindAsync(userName);
            if (account == null) return NotFound();

            account.DisplayName = request.DisplayName;
            if (isAdmin) account.Type = request.Type; // chỉ Admin mới đổi được quyền

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Đổi mật khẩu CHÍNH MÌNH - cần đúng mật khẩu cũ
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

        // Admin CẤP LẠI mật khẩu cho người khác - KHÔNG cần biết mật khẩu cũ
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
        public int Type { get; set; }
        public string Role { get; set; } = null!;
    }

    public class UpdateAccountRequest
    {
        public string DisplayName { get; set; } = null!;
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