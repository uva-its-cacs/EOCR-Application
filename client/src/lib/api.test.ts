import { it, vi, expect, describe, afterEach } from 'vitest';

import { ApiError, apiFetch } from './api';

// ----------------------------------------------------------------------

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', fetchMock);

afterEach(() => {
  fetchMock.mockReset();
});

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
}

async function caught(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected the promise to reject');
}

describe('apiFetch', () => {
  it('returns the parsed JSON body on success', async () => {
    fetchMock.mockResolvedValue(json({ userId: 1, name: 'Dana Example' }));

    await expect(apiFetch('/api/me')).resolves.toEqual({ userId: 1, name: 'Dana Example' });
  });

  it('passes the path and init to fetch', async () => {
    fetchMock.mockResolvedValue(json({}));
    const init = { method: 'PUT', body: '{}' };

    await apiFetch('/api/software/1', init);

    expect(fetchMock).toHaveBeenCalledWith('/api/software/1', init);
  });

  it('throws an ApiError with the status and the ProblemDetails of a JSON error body', async () => {
    const problem = {
      title: 'Check the software fields.',
      status: 400,
      errors: { SoftwareName: ['The SoftwareName field is required.'] },
    };
    fetchMock.mockResolvedValue(json(problem, { status: 400, statusText: 'Bad Request' }));

    const error = await caught(apiFetch('/api/software/1'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, message: 'Check the software fields.', problem });
  });

  it('throws an ApiError built from the status line when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html>Bad gateway</html>', {
        status: 502,
        statusText: 'Bad Gateway',
        headers: { 'Content-Type': 'text/html' },
      })
    );

    const error = await caught(apiFetch('/api/me'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 502, message: '502 Bad Gateway', problem: null });
  });

  it('ignores a JSON content type with a body that does not parse', async () => {
    fetchMock.mockResolvedValue(
      new Response('not json', {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    expect(await caught(apiFetch('/api/me'))).toMatchObject({
      status: 500,
      message: '500 Internal Server Error',
      problem: null,
    });
  });

  it('keeps the 401 status so callers can tell "not signed in" from other failures', async () => {
    fetchMock.mockResolvedValue(json({ title: 'Unauthorized', status: 401 }, { status: 401 }));

    expect(await caught(apiFetch('/api/me'))).toMatchObject({
      status: 401,
      message: 'Unauthorized',
    });
  });

  it('returns undefined for a 204 response', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiFetch('/api/software/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('turns a network failure into an ApiError with status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await caught(apiFetch('/api/me'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 0,
      message: 'Could not reach the server.',
      problem: null,
    });
  });

  it('hands the AbortSignal to fetch and rethrows an abort as is', async () => {
    const controller = new AbortController();
    const abort = new DOMException('The operation was aborted.', 'AbortError');
    fetchMock.mockRejectedValue(abort);

    const error = await caught(apiFetch('/api/software', { signal: controller.signal }));

    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal);
    expect(error).toBe(abort);
    expect(error).not.toBeInstanceOf(ApiError);
  });
});
