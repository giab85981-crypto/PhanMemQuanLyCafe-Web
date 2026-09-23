using System;
using System.Collections.Generic;

namespace PhanMemQuanLyCafe.Api.Models;

public partial class Bill
{
    public int Id { get; set; }

    public DateTime DateCheckIn { get; set; }

    public DateTime? DateCheckOut { get; set; }

    public int IdTable { get; set; }

    public int Status { get; set; }

    public int? Discount { get; set; }

    public double? TotalPrice { get; set; }

    public int? IdCustomer { get; set; }

    public virtual ICollection<BillInfo> BillInfos { get; set; } = new List<BillInfo>();

    public virtual Customer? IdCustomerNavigation { get; set; }

    public virtual TableFood IdTableNavigation { get; set; } = null!;

    public virtual ICollection<KitchenOrder> KitchenOrders { get; set; } = new List<KitchenOrder>();
}
