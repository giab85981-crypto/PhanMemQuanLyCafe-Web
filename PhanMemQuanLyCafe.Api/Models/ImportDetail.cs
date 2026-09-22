using System;
using System.Collections.Generic;

namespace PhanMemQuanLyCafe.Api.Models;

public partial class ImportDetail
{
    public int Id { get; set; }

    public int IdImportReceipt { get; set; }

    public int IdIngredient { get; set; }

    public double Count { get; set; }

    public double ImportPrice { get; set; }

    public virtual ImportReceipt IdImportReceiptNavigation { get; set; } = null!;

    public virtual Ingredient IdIngredientNavigation { get; set; } = null!;
}
