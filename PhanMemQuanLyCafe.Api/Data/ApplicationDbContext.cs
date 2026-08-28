using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using PhanMemQuanLyCafe.Api.Models;

namespace PhanMemQuanLyCafe.Api.Data;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Account> Accounts { get; set; }

    public virtual DbSet<Bill> Bills { get; set; }

    public virtual DbSet<BillInfo> BillInfos { get; set; }

    public virtual DbSet<Food> Foods { get; set; }

    public virtual DbSet<FoodCategory> FoodCategories { get; set; }

    public virtual DbSet<TableFood> TableFoods { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:DefaultConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.UserName).HasName("PK__Account__C9F28457768C837E");

            entity.ToTable("Account");

            entity.Property(e => e.UserName).HasMaxLength(100);
            entity.Property(e => e.DisplayName)
                .HasMaxLength(100)
                .HasDefaultValue("Kter");
            entity.Property(e => e.PassWord)
                .HasMaxLength(1000)
                .HasDefaultValueSql("((0))");
        });

        modelBuilder.Entity<Bill>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Bill__3213E83FA5C7E340");

            entity.ToTable("Bill", tb => tb.HasTrigger("UTG_UpdateBill"));

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DateCheckIn)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DateCheckOut).HasColumnType("datetime");
            entity.Property(e => e.Discount).HasColumnName("discount");
            entity.Property(e => e.IdTable).HasColumnName("idTable");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.TotalPrice).HasColumnName("totalPrice");

            entity.HasOne(d => d.IdTableNavigation).WithMany(p => p.Bills)
                .HasForeignKey(d => d.IdTable)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bill__status__6EF57B66");
        });

        modelBuilder.Entity<BillInfo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__BillInfo__3213E83F4BB1E82B");

            entity.ToTable("BillInfo", tb =>
                {
                    tb.HasTrigger("UTG_DeleteBillInfo");
                    tb.HasTrigger("UTG_UpdateBillInfo");
                });

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Count).HasColumnName("count");
            entity.Property(e => e.IdBill).HasColumnName("idBill");
            entity.Property(e => e.IdFood).HasColumnName("idFood");

            entity.HasOne(d => d.IdBillNavigation).WithMany(p => p.BillInfos)
                .HasForeignKey(d => d.IdBill)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BillInfo__count__72C60C4A");

            entity.HasOne(d => d.IdFoodNavigation).WithMany(p => p.BillInfos)
                .HasForeignKey(d => d.IdFood)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BillInfo__idFood__73BA3083");
        });

        modelBuilder.Entity<Food>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Food__3213E83F4E9B1575");

            entity.ToTable("Food");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IdCategory).HasColumnName("idCategory");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasDefaultValue("Chưa đặt tên")
                .HasColumnName("name");
            entity.Property(e => e.Price).HasColumnName("price");

            entity.HasOne(d => d.IdCategoryNavigation).WithMany(p => p.Foods)
                .HasForeignKey(d => d.IdCategory)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Food__price__6A30C649");
        });

        modelBuilder.Entity<FoodCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__FoodCate__3213E83F1BF85A33");

            entity.ToTable("FoodCategory");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasDefaultValue("Chưa đặt tên")
                .HasColumnName("name");
        });

        modelBuilder.Entity<TableFood>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TableFoo__3213E83F0937B2EE");

            entity.ToTable("TableFood");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasDefaultValue("Bàn chưa có tên")
                .HasColumnName("name");
            entity.Property(e => e.Status)
                .HasMaxLength(100)
                .HasDefaultValue("Trống")
                .HasColumnName("status");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
