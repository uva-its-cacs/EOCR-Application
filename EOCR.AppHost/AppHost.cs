var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.Eocr_Server>("api")
    .WithHttpHealthCheck("/health", endpointName: "https");

builder.AddViteApp("client", "../client")
    .WithReference(api)
    .WaitFor(api);

builder.Build().Run();
