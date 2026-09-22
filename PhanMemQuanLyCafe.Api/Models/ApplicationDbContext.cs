using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace PhanMemQuanLyCafe.Api.Models;

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

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Food> Foods { get; set; }

    public virtual DbSet<FoodCategory> FoodCategories { get; set; }

    public virtual DbSet<ImportDetail> ImportDetails { get; set; }

    public virtual DbSet<ImportReceipt> ImportReceipts { get; set; }

    public virtual DbSet<Ingredient> Ingredients { get; set; }

    public virtual DbSet<KitchenOrder> KitchenOrders { get; set; }

    public virtual DbSet<KitchenOrderDetail> KitchenOrderDetails { get; set; }

    public virtual DbSet<Recipe> Recipes { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Supplier> Suppliers { get; set; }

    public virtual DbSet<TableFood> TableFoods { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:DefaultConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.UserName).HasName("PK__Account__C9F284577DB5726D");

            entity.ToTable("Account");

            entity.Property(e => e.UserName).HasMaxLength(100);
            entity.Property(e => e.DisplayName)
                .HasMaxLength(100)
                .HasDefaultValue("Kter");
            entity.Property(e => e.IdRole).HasColumnName("idRole");
            entity.Property(e => e.PassWord)
                .HasMaxLength(1000)
                .HasDefaultValue("0");

            entity.HasOne(d => d.IdRoleNavigation).WithMany(p => p.Accounts)
                .HasForeignKey(d => d.IdRole)
                .HasConstraintName("FK_Account_Role");
        });

        modelBuilder.Entity<Bill>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Bill__3213E83F16463C06");

            entity.ToTable("Bill");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DateCheckIn)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DateCheckOut).HasColumnType("datetime");
            entity.Property(e => e.Discount)
                .HasDefaultValue(0)
                .HasColumnName("discount");
            entity.Property(e => e.IdCustomer).HasColumnName("idCustomer");
            entity.Property(e => e.IdTable).HasColumnName("idTable");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.TotalPrice)
                .HasDefaultValue(0.0)
                .HasColumnName("totalPrice");

            entity.HasOne(d => d.IdCustomerNavigation).WithMany(p => p.Bills)
                .HasForeignKey(d => d.IdCustomer)
                .HasConstraintName("FK_Bill_Customer");

            entity.HasOne(d => d.IdTableNavigation).WithMany(p => p.Bills)
                .HasForeignKey(d => d.IdTable)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Bill_Table");
        });

        modelBuilder.Entity<BillInfo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__BillInfo__3213E83F5C93E71B");

            entity.ToTable("BillInfo");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Count).HasColumnName("count");
            entity.Property(e => e.IdBill).HasColumnName("idBill");
            entity.Property(e => e.IdFood).HasColumnName("idFood");

            entity.HasOne(d => d.IdBillNavigation).WithMany(p => p.BillInfos)
                .HasForeignKey(d => d.IdBill)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BillInfo_Bill");

            entity.HasOne(d => d.IdFoodNavigation).WithMany(p => p.BillInfos)
                .HasForeignKey(d => d.IdFood)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BillInfo_Food");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Customer__3213E83F242CB697");

            entity.ToTable("Customer");

            entity.HasIndex(e => e.Phone, "UQ__Customer__B43B145FB7B7D1F5").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.Points)
                .HasDefaultValue(0)
                .HasColumnName("points");
        });

        modelBuilder.Entity<Food>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Food__3213E83F7301FF6F");

            entity.ToTable("Food");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IdCategory).HasColumnName("idCategory");
            entity.Property(e => e.IsAvailable)
                .HasDefaultValue(true)
                .HasColumnName("isAvailable");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasDefaultValue("Chưa đặt tên")
                .HasColumnName("name");
            entity.Property(e => e.Price).HasColumnName("price");

            entity.HasOne(d => d.IdCategoryNavigation).WithMany(p => p.Foods)
                .HasForeignKey(d => d.IdCategory)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Food_Category");
        });

        modelBuilder.Entity<FoodCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__FoodCate__3213E83F727FA5D9");

            entity.ToTable("FoodCategory");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasDefaultValue("Chưa đặt tên")
                .HasColumnName("name");
        });

        modelBuilder.Entity<ImportDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ImportDe__3213E83FB41C2060");

            entity.ToTable("ImportDetail");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Count).HasColumnName("count");
            entity.Property(e => e.IdImportReceipt).HasColumnName("idImportReceipt");
            entity.Property(e => e.IdIngredient).HasColumnName("idIngredient");
            entity.Property(e => e.ImportPrice).HasColumnName("importPrice");

            entity.HasOne(d => d.IdImportReceiptNavigation).WithMany(p => p.ImportDetails)
                .HasForeignKey(d => d.IdImportReceipt)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ImportDetail_Receipt");

            entity.HasOne(d => d.IdIngredientNavigation).WithMany(p => p.ImportDetails)
                .HasForeignKey(d => d.IdIngredient)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ImportDetail_Ingredient");
        });

        modelBuilder.Entity<ImportReceipt>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ImportRe__3213E83F83F61C58");

            entity.ToTable("ImportReceipt");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(100)
                .HasColumnName("createdBy");
            entity.Property(e => e.IdSupplier).HasColumnName("idSupplier");
            entity.Property(e => e.ImportDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("importDate");
            entity.Property(e => e.TotalAmount)
                .HasDefaultValue(0.0)
                .HasColumnName("totalAmount");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ImportReceipts)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_Import_Account");

            entity.HasOne(d => d.IdSupplierNavigation).WithMany(p => p.ImportReceipts)
                .HasForeignKey(d => d.IdSupplier)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Import_Supplier");
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Ingredie__3213E83FD9D6B4EB");

            entity.ToTable("Ingredient");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.MinQuantity)
                .HasDefaultValue(10.0)
                .HasColumnName("minQuantity");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.Unit)
                .HasMaxLength(20)
                .HasColumnName("unit");
        });

        modelBuilder.Entity<KitchenOrder>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__KitchenO__3213E83F9DC87FA1");

            entity.ToTable("KitchenOrder");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("createdAt");
            entity.Property(e => e.IdBill).HasColumnName("idBill");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending")
                .HasColumnName("status");

            entity.HasOne(d => d.IdBillNavigation).WithMany(p => p.KitchenOrders)
                .HasForeignKey(d => d.IdBill)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_KitchenOrder_Bill");
        });

        modelBuilder.Entity<KitchenOrderDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__KitchenO__3213E83F8FCD3047");

            entity.ToTable("KitchenOrderDetail");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Count).HasColumnName("count");
            entity.Property(e => e.IdFood).HasColumnName("idFood");
            entity.Property(e => e.IdKitchenOrder).HasColumnName("idKitchenOrder");
            entity.Property(e => e.Note)
                .HasMaxLength(200)
                .HasColumnName("note");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending")
                .HasColumnName("status");

            entity.HasOne(d => d.IdFoodNavigation).WithMany(p => p.KitchenOrderDetails)
                .HasForeignKey(d => d.IdFood)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_KOD_Food");

            entity.HasOne(d => d.IdKitchenOrderNavigation).WithMany(p => p.KitchenOrderDetails)
                .HasForeignKey(d => d.IdKitchenOrder)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_KOD_KitchenOrder");
        });

        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Recipe__3213E83F200682D4");

            entity.ToTable("Recipe");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Amount).HasColumnName("amount");
            entity.Property(e => e.IdFood).HasColumnName("idFood");
            entity.Property(e => e.IdIngredient).HasColumnName("idIngredient");

            entity.HasOne(d => d.IdFoodNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.IdFood)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Recipe_Food");

            entity.HasOne(d => d.IdIngredientNavigation).WithMany(p => p.Recipes)
                .HasForeignKey(d => d.IdIngredient)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Recipe_Ingredient");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Role__3213E83FC8EE7ADB");

            entity.ToTable("Role");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Supplier__3213E83F5DAB6807");

            entity.ToTable("Supplier");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Address)
                .HasMaxLength(200)
                .HasColumnName("address");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
        });

        modelBuilder.Entity<TableFood>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TableFoo__3213E83F8340176B");

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
