using System.ComponentModel.DataAnnotations;

namespace Eocr.Server.DTOs;

public class DevBlobMoveDto
{
    [Required]
    public string FromPath { get; set; } = string.Empty;
    [Required]
    public string ToPath { get; set; } = string.Empty;
    public bool IsFolder { get; set; }
}
