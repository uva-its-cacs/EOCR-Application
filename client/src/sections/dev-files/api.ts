import type { DevBlobItem, DevBlobListing } from './types';

import { apiFetch } from 'src/lib/api';

const BASE = '/api/dev/blobs';

export function fetchDevBlobs(prefix: string): Promise<DevBlobListing> {
  return apiFetch<DevBlobListing>(`${BASE}?prefix=${encodeURIComponent(prefix)}`);
}

export function uploadDevBlobs(prefix: string, files: File[]): Promise<DevBlobItem[]> {
  const body = new FormData();
  files.forEach((file) => body.append('files', file));

  return apiFetch<DevBlobItem[]>(`${BASE}/upload?prefix=${encodeURIComponent(prefix)}`, {
    method: 'POST',
    body,
  });
}

export function createDevBlobFolder(path: string): Promise<void> {
  return apiFetch<void>(`${BASE}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
}

export function moveDevBlob(item: DevBlobItem, toPath: string): Promise<void> {
  return apiFetch<void>(`${BASE}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromPath: item.path, toPath, isFolder: item.isFolder }),
  });
}

export function deleteDevBlob(item: DevBlobItem): Promise<void> {
  return apiFetch<void>(`${BASE}?path=${encodeURIComponent(item.path)}&isFolder=${item.isFolder}`, {
    method: 'DELETE',
  });
}

export function devBlobDownloadUrl(path: string): string {
  return `${BASE}/download?path=${encodeURIComponent(path)}`;
}
