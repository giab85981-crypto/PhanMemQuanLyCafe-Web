using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhanMemQuanLyCafe.Api.Data;
using PhanMemQuanLyCafe.Api.Models;

namespace PhanMemQuanLyCafe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AccountsController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Account>>> GetAccounts()
            => await _context.Accounts.ToListAsync();

        [HttpGet("{userName}")]
        public async Task<ActionResult<Account>> GetAccount(string userName)
        {
            var account = await _context.Accounts.FindAsync(userName);
            if (account == null) return NotFound();
            return account;
        }

        // POST: api/accounts/login
        [HttpPost("login")]
        public async Task<ActionResult<Account>> Login([FromBody] LoginRequest request)
        {
            string hashedPassword = ComputeMd5Hash(request.PassWord);

            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.UserName == request.UserName && a.PassWord == hashedPassword);

            if (account == null) return Unauthorized("Sai tài khoản hoặc mật khẩu");
            return account;
        }

        // POST: api/accounts   (Tạo tài khoản mới - password được hash trước khi lưu)
        [HttpPost]
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

        // PUT: api/accounts/{userName}   (Chỉ cập nhật DisplayName/Type, KHÔNG đụng password)
        [HttpPut("{userName}")]
        public async Task<IActionResult> UpdateAccount(string userName, UpdateAccountRequest request)
        {
            var account = await _context.Accounts.FindAsync(userName);
            if (account == null) return NotFound();

            account.DisplayName = request.DisplayName;
            account.Type = request.Type;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/accounts/{userName}/change-password
        [HttpPut("{userName}/change-password")]
        public async Task<IActionResult> ChangePassword(string userName, ChangePasswordRequest request)
        {
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

        [HttpDelete("{userName}")]
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
}