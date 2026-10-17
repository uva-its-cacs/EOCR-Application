namespace Eocr.Server.DTOs;

public class DevBlobItemDto
{
    // Full blob path (folders have no trailing slash).
    public string Path { get; set; } = string.Empty;
    // Last path segment.
    public string Name { get; set; } = string.Empty;
    public bool IsFolder { get; set; }
    public long Size { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTimeOffset? ModifiedAt { get; set; }
}
