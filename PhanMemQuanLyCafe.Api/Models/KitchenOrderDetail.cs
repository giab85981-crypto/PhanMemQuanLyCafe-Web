using System;
using System.Collections.Generic;

namespace PhanMemQuanLyCafe.Api.Models;

public partial class KitchenOrderDetail
{
    public int Id { get; set; }

    public int IdKitchenOrder { get; set; }

    public int IdFood { get; set; }

    public int Count { get; set; }

    public string? Status { get; set; }

    public string? Note { get; set; }

    public virtual Food IdFoodNavigation { get; set; } = null!;

    public virtual KitchenOrder IdKitchenOrderNavigation { get; set; } = null!;
}
