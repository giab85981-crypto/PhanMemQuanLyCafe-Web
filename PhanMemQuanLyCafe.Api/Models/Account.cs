namespace PhanMemQuanLyCafe.Api.Models;

public partial class Account
{
    public string UserName { get; set; } = null!;

    public string DisplayName { get; set; } = null!;

    public string PassWord { get; set; } = null!;

    public int? IdRole { get; set; }

    public virtual Role? IdRoleNavigation { get; set; }

    public virtual ICollection<ImportReceipt> ImportReceipts { get; set; } = new List<ImportReceipt>();
    //public int Type { get; internal set; }
}
