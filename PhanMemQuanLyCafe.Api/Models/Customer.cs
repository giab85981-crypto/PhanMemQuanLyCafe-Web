using System;
using System.Collections.Generic;

namespace PhanMemQuanLyCafe.Api.Models;

public partial class Customer
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public int? Points { get; set; }

    public virtual ICollection<Bill> Bills { get; set; } = new List<Bill>();
}
