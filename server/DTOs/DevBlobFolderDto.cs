using System.ComponentModel.DataAnnotations;

namespace Eocr.Server.DTOs;

public class DevBlobFolderDto
{
    [Required]
    public string Path { get; set; } = string.Empty;
}
