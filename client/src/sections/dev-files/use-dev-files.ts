import type { DevBlobItem } from './types';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  moveDevBlob,
  fetchDevBlobs,
  deleteDevBlob,
  uploadDevBlobs,
  createDevBlobFolder,
} from './api';

// ----------------------------------------------------------------------

const KEY = ['dev-blobs'] as const;

export function useDevBlobs(prefix: string) {
  return useQuery({
    queryKey: [...KEY, prefix],
    queryFn: () => fetchDevBlobs(prefix),
    retry: false,
  });
}

// Every change refreshes all folder listings (a move touches two of them).
function useRefreshing<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUploadDevBlobs(prefix: string) {
  return useRefreshing((files: File[]) => uploadDevBlobs(prefix, files));
}

export function useCreateDevFolder() {
  return useRefreshing((path: string) => createDevBlobFolder(path));
}

export function useMoveDevBlob() {
  return useRefreshing((input: { item: DevBlobItem; toPath: string }) =>
    moveDevBlob(input.item, input.toPath)
  );
}

export function useDeleteDevBlob() {
  return useRefreshing((item: DevBlobItem) => deleteDevBlob(item));
}
