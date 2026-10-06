namespace Eocr.Server.Data.Entities;

public class Code
{
    public int CodeId { get; set; }
    public string CodeType { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public bool IsSystem { get; set; }
}
