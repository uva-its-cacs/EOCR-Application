// Fetch wrapper for the API. Paths are relative (`/api/...`), so the Vite proxy handles the host.

// ASP.NET Core ProblemDetails / ValidationProblemDetails body.
export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  // HTTP status, or 0 when the server could not be reached.
  status: number;

  // Parsed ProblemDetails body, or null when the response had no JSON body.
  problem: ProblemDetails | null;

  constructor(status: number, message: string, problem: ProblemDetails | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function readProblem(res: Response): Promise<ProblemDetails | null> {
  if (!(res.headers.get('content-type') ?? '').includes('json')) return null;

  try {
    const body: unknown = await res.json();
    return typeof body === 'object' && body !== null ? (body as ProblemDetails) : null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(path, init);
  } catch (error) {
    // An aborted request (init.signal) is not a failure: let the caller see the abort as is.
    if (isAbortError(error)) throw error;
    throw new ApiError(0, 'Could not reach the server.');
  }

  if (!res.ok) {
    const problem = await readProblem(res);
    throw new ApiError(
      res.status,
      problem?.title ?? `${res.status} ${res.statusText}`.trim(),
      problem
    );
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
