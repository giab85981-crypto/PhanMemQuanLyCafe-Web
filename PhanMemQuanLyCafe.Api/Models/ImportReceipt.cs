using System;
using System.Collections.Generic;

namespace PhanMemQuanLyCafe.Api.Models;

public partial class ImportReceipt
{
    public int Id { get; set; }

    public int IdSupplier { get; set; }

    public DateTime? ImportDate { get; set; }

    public double? TotalAmount { get; set; }

    public string? CreatedBy { get; set; }

    public virtual Account? CreatedByNavigation { get; set; }

    public virtual Supplier IdSupplierNavigation { get; set; } = null!;

    public virtual ICollection<ImportDetail> ImportDetails { get; set; } = new List<ImportDetail>();
}
