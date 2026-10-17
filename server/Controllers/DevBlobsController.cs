using Eocr.Server.DTOs;
using Eocr.Server.Repos;
using Microsoft.AspNetCore.Mvc;

namespace Eocr.Server.Controllers;

// Dev-only proof of concept for uploading documents to blob storage and organizing them in folders.
// Every action is "not found" outside Development. Not the real document flow.
[ApiController]
[Route("api/dev/blobs")]
public class DevBlobsController(IWebHostEnvironment env, IDevBlobRepo repo) : ControllerBase
{
    private ObjectResult Fail(DevBlobException ex) => Problem(title: ex.Message, statusCode: ex.Status);

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? prefix, CancellationToken ct)
    {
        if (!env.IsDevelopment()) return NotFound();
        try { return Ok(await repo.ListAsync(prefix ?? string.Empty, ct)); }
        catch (DevBlobException ex) { return Fail(ex); }
    }

    [HttpPost("upload")]
    [RequestSizeLimit(200_000_000)]
    public async Task<IActionResult> Upload([FromQuery] string? prefix, [FromForm] IFormFileCollection files, CancellationToken ct)
    {
        if (!env.IsDevelopment()) return NotFound();
        if (files.Count == 0) return Fail(new DevBlobException(400, "Choose at least one file."));
        try { return Ok(await repo.UploadAsync(prefix ?? string.Empty, files, ct)); }
        catch (DevBlobException ex) { return Fail(ex); }
    }

    [HttpPost("folders")]
    public async Task<IActionResult> CreateFolder(DevBlobFolderDto input, CancellationToken ct)
    {
        if (!env.IsDevelopment()) return NotFound();
        try { await repo.CreateFolderAsync(input.Path, ct); return NoContent(); }
        catch (DevBlobException ex) { return Fail(ex); }
    }

    [HttpPost("move")]
    public async Task<IActionResult> Move(DevBlobMoveDto input, CancellationToken ct)
    {
        if (!env.IsDevelopment()) return NotFound();
        try { await repo.MoveAsync(input, ct); return NoContent(); }
        catch (DevBlobException ex) { return Fail(ex); }
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromQuery] string path, [FromQuery] bool isFolder, CancellationToken ct)
    {
        if (!env.IsDevelopment()) return NotFound();
        try { await repo.DeleteAsync(path, isFolder, ct); return NoContent(); }
        catch (DevBlobException ex) { return Fail(ex); }
    }

    [HttpGet("download")]
    public async Task<IActionResult> Download([FromQuery] string path, CancellationToken ct)
    {
        if (!env.IsDevelopment()) return NotFound();
        try
        {
            var file = await repo.DownloadAsync(path, ct);
            if (file is null) return NotFound();
            return File(file.Value.Content, file.Value.ContentType, file.Value.Name);
        }
        catch (DevBlobException ex) { return Fail(ex); }
    }
}
