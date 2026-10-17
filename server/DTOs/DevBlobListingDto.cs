namespace Eocr.Server.DTOs;

public class DevBlobListingDto
{
    // The folder listed, without a trailing slash; empty is the container root.
    public string Prefix { get; set; } = string.Empty;
    public List<DevBlobItemDto> Items { get; set; } = [];
}
