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

        private static string ComputeMd5Hash(string input)
        {
            using var md5 = System.Security.Cryptography.MD5.Create();
            byte[] bytes = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
            var sb = new System.Text.StringBuilder();
            foreach (var b in bytes) sb.Append(b.ToString("x2"));
            return sb.ToString();
        }

        [HttpPost]
        public async Task<ActionResult<Account>> CreateAccount(Account account)
        {
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAccount), new { userName = account.UserName }, account);
        }

        [HttpPut("{userName}")]
        public async Task<IActionResult> UpdateAccount(string userName, Account account)
        {
            if (userName != account.UserName) return BadRequest();
            _context.Entry(account).State = EntityState.Modified;
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
    }

    public class LoginRequest
    {
        public string UserName { get; set; } = null!;
        public string PassWord { get; set; } = null!;
    }
}