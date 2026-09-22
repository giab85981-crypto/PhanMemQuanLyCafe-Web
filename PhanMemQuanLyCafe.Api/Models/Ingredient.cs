using System;
using System.Collections.Generic;

namespace PhanMemQuanLyCafe.Api.Models;

public partial class Ingredient
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Unit { get; set; } = null!;

    public double Quantity { get; set; }

    public double MinQuantity { get; set; }

    public virtual ICollection<ImportDetail> ImportDetails { get; set; } = new List<ImportDetail>();

    public virtual ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
}
