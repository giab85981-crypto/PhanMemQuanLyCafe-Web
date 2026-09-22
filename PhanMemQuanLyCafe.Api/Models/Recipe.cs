using System;
using System.Collections.Generic;

namespace PhanMemQuanLyCafe.Api.Models;

public partial class Recipe
{
    public int Id { get; set; }

    public int IdFood { get; set; }

    public int IdIngredient { get; set; }

    public double Amount { get; set; }

    public virtual Food IdFoodNavigation { get; set; } = null!;

    public virtual Ingredient IdIngredientNavigation { get; set; } = null!;
}
