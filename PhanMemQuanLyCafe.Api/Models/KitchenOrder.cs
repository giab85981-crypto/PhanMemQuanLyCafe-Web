using System;
using System.Collections.Generic;

namespace PhanMemQuanLyCafe.Api.Models;

public partial class KitchenOrder
{
    public int Id { get; set; }

    public int IdBill { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? Status { get; set; }

    public virtual Bill IdBillNavigation { get; set; } = null!;

    public virtual ICollection<KitchenOrderDetail> KitchenOrderDetails { get; set; } = new List<KitchenOrderDetail>();
}
