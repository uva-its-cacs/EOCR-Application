using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Eocr.Server.DTOs;

namespace Eocr.Server.Repos;

// Thrown for bad paths and missing configuration; the controller maps it to a status code.
public class DevBlobException(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}

public interface IDevBlobRepo
{
    Task<DevBlobListingDto> ListAsync(string prefix, CancellationToken ct);
    Task<List<DevBlobItemDto>> UploadAsync(string prefix, IFormFileCollection files, CancellationToken ct);
    Task CreateFolderAsync(string path, CancellationToken ct);
    Task MoveAsync(DevBlobMoveDto input, CancellationToken ct);
    Task DeleteAsync(string path, bool isFolder, CancellationToken ct);
    Task<(Stream Content, string ContentType, string Name)?> DownloadAsync(string path, CancellationToken ct);
}

// Dev-only proof of concept over one blob container (see DevBlobsController). Folders are virtual:
// a "/" delimiter in blob names, with a zero-byte ".keep" blob so an empty folder shows up.
public class DevBlobRepo(IConfiguration config) : IDevBlobRepo
{
    private const string KeepName = ".keep";

    private async Task<BlobContainerClient> GetContainerAsync(CancellationToken ct)
    {
        var section = config.GetSection("BlobStorage");
        var containerName = section["ContainerName"];
        var connectionString = section["ConnectionString"];
        var serviceUri = section["ServiceUri"];

        BlobServiceClient service;
        if (!string.IsNullOrWhiteSpace(connectionString))
            service = new BlobServiceClient(connectionString);
        else if (!string.IsNullOrWhiteSpace(serviceUri))
            service = new BlobServiceClient(new Uri(serviceUri), new DefaultAzureCredential());
        else
            throw new DevBlobException(503, "Blob storage is not configured. Set BlobStorage:ConnectionString (or BlobStorage:ServiceUri) and BlobStorage:ContainerName.");

        if (string.IsNullOrWhiteSpace(containerName))
            throw new DevBlobException(503, "Set BlobStorage:ContainerName.");

        var container = service.GetBlobContainerClient(containerName);
        await container.CreateIfNotExistsAsync(cancellationToken: ct);
        return container;
    }

    // Trim slashes and reject anything that could climb out of a folder.
    private static string Clean(string? path)
    {
        var parts = (path ?? string.Empty).Replace('\\', '/')
            .Split('/', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Any(p => p is "." or ".."))
            throw new DevBlobException(400, "Invalid path.");
        return string.Join('/', parts);
    }

    private static string Join(string prefix, string name) => prefix.Length == 0 ? name : $"{prefix}/{name}";

    private static string Leaf(string path) => path[(path.LastIndexOf('/') + 1)..];

    public async Task<DevBlobListingDto> ListAsync(string prefix, CancellationToken ct)
    {
        prefix = Clean(prefix);
        var container = await GetContainerAsync(ct);
        var listing = new DevBlobListingDto { Prefix = prefix };
        var search = prefix.Length == 0 ? string.Empty : prefix + "/";

        await foreach (var item in container.GetBlobsByHierarchyAsync(BlobTraits.None, BlobStates.None, delimiter: "/", prefix: search, cancellationToken: ct))
        {
            if (item.IsPrefix)
            {
                var folder = item.Prefix.TrimEnd('/');
                listing.Items.Add(new DevBlobItemDto { Path = folder, Name = Leaf(folder), IsFolder = true });
            }
            else if (Leaf(item.Blob.Name) != KeepName)
            {
                listing.Items.Add(new DevBlobItemDto
                {
                    Path = item.Blob.Name,
                    Name = Leaf(item.Blob.Name),
                    Size = item.Blob.Properties.ContentLength ?? 0,
                    ContentType = item.Blob.Properties.ContentType ?? string.Empty,
                    ModifiedAt = item.Blob.Properties.LastModified,
                });
            }
        }

        return listing;
    }

    public async Task<List<DevBlobItemDto>> UploadAsync(string prefix, IFormFileCollection files, CancellationToken ct)
    {
        prefix = Clean(prefix);
        var container = await GetContainerAsync(ct);
        var uploaded = new List<DevBlobItemDto>();

        foreach (var file in files)
        {
            var name = Clean(Path.GetFileName(file.FileName));
            if (name.Length == 0) continue;
            var path = Join(prefix, name);
            var contentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType;

            await using var stream = file.OpenReadStream();
            await container.GetBlobClient(path).UploadAsync(stream, new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders { ContentType = contentType },
            }, ct);

            uploaded.Add(new DevBlobItemDto
            {
                Path = path,
                Name = name,
                Size = file.Length,
                ContentType = contentType,
                ModifiedAt = DateTimeOffset.UtcNow,
            });
        }

        return uploaded;
    }

    public async Task CreateFolderAsync(string path, CancellationToken ct)
    {
        path = Clean(path);
        if (path.Length == 0) throw new DevBlobException(400, "Enter a folder name.");
        var container = await GetContainerAsync(ct);
        await container.GetBlobClient(Join(path, KeepName)).UploadAsync(BinaryData.FromBytes([]), overwrite: true, ct);
    }

    public async Task MoveAsync(DevBlobMoveDto input, CancellationToken ct)
    {
        var from = Clean(input.FromPath);
        var to = Clean(input.ToPath);
        if (from.Length == 0 || to.Length == 0) throw new DevBlobException(400, "Both paths are required.");
        if (from == to) return;
        if (input.IsFolder && to.StartsWith(from + "/", StringComparison.Ordinal))
            throw new DevBlobException(400, "A folder cannot move into itself.");

        var container = await GetContainerAsync(ct);
        var sources = new List<string>();
        if (input.IsFolder)
        {
            await foreach (var blob in container.GetBlobsAsync(BlobTraits.None, BlobStates.None, prefix: from + "/", cancellationToken: ct))
                sources.Add(blob.Name);
        }
        else
        {
            sources.Add(from);
        }

        if (sources.Count == 0) throw new DevBlobException(404, "Nothing to move.");

        // Refuse to overwrite an existing blob at the destination.
        foreach (var source in sources)
        {
            var target = to + source[from.Length..];
            if (await container.GetBlobClient(target).ExistsAsync(ct))
                throw new DevBlobException(409, $"\"{target}\" already exists.");
        }

        foreach (var source in sources)
        {
            var target = to + source[from.Length..];
            var sourceClient = container.GetBlobClient(source);
            var copy = await container.GetBlobClient(target).StartCopyFromUriAsync(sourceClient.Uri, cancellationToken: ct);
            await copy.WaitForCompletionAsync(ct);
            await sourceClient.DeleteIfExistsAsync(cancellationToken: ct);
        }
    }

    public async Task DeleteAsync(string path, bool isFolder, CancellationToken ct)
    {
        path = Clean(path);
        if (path.Length == 0) throw new DevBlobException(400, "A path is required.");
        var container = await GetContainerAsync(ct);

        if (isFolder)
        {
            await foreach (var blob in container.GetBlobsAsync(BlobTraits.None, BlobStates.None, prefix: path + "/", cancellationToken: ct))
                await container.GetBlobClient(blob.Name).DeleteIfExistsAsync(cancellationToken: ct);
        }
        else
        {
            await container.GetBlobClient(path).DeleteIfExistsAsync(cancellationToken: ct);
        }
    }

    public async Task<(Stream Content, string ContentType, string Name)?> DownloadAsync(string path, CancellationToken ct)
    {
        path = Clean(path);
        var container = await GetContainerAsync(ct);
        var blob = container.GetBlobClient(path);
        if (path.Length == 0 || !await blob.ExistsAsync(ct)) return null;

        var result = await blob.DownloadStreamingAsync(cancellationToken: ct);
        return (result.Value.Content, result.Value.Details.ContentType, Leaf(path));
    }
}
