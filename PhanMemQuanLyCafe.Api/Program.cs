using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace PhanMemQuanLyCafe.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // 1. Cấu hình Database
            builder.Services.AddDbContext<PhanMemQuanLyCafe.Api.Data.ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // 2. Cấu hình CORS (Cho phép React Vite - localhost:5173 gọi API)
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    policy.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            // 3. Cấu hình JWT Authentication
            var jwtKey = builder.Configuration["Jwt:Key"] ?? "SuperSecretKeyForCafeManagementSystem2026";
            var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "PhanMemQuanLyCafe.Api";
            var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "PhanMemQuanLyCafe.Client";

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                };
            });

            // 4. Cấu hình Controllers & JSON options
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                });

            builder.Services.AddEndpointsApiExplorer();

            // 5. Cấu hình Swagger để hỗ trợ ô nhập Token (Nút Authorize)
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "PhanMemQuanLyCafe.Api", Version = "v1" });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Nhập Token theo định dạng: Bearer {token_cua_ban}"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // 6. Thứ tự Middleware quan trọng: CORS -> Authentication -> Authorization
            app.UseCors("AllowReactApp");

            app.UseAuthentication(); // Bổ sung Middleware Xác thực người dùng
            app.UseAuthorization();  // Middleware Phân quyền

            app.MapControllers();

            app.Run();
        }
    }
}