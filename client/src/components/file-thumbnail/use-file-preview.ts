import { useMemo } from 'react';

// ----------------------------------------------------------------------

// EOCR: the preview URL is derived with useMemo (no setState in an effect, which the React compiler lint
// rules forbid). Object URLs are cached per File and not revoked: revoking in an effect cleanup breaks
// under StrictMode, which runs the cleanup and then reuses the memoized URL. The leak is bounded by the
// files a user picks in one session. `setPreviewUrl` and `setFilesPreview` were never used and are removed.

const objectUrls = new WeakMap<File, string>();

function objectUrlFor(file: File): string {
  let url = objectUrls.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    objectUrls.set(file, url);
  }
  return url;
}

export type UseFilePreviewReturn = {
  previewUrl: string;
};

export function useFilePreview(file?: File | string | null): UseFilePreviewReturn {
  const previewUrl = useMemo(() => {
    if (file instanceof File) return objectUrlFor(file);
    if (typeof file === 'string') return file;
    return '';
  }, [file]);

  return { previewUrl };
}

// ----------------------------------------------------------------------

export type FilePreviewItem = {
  previewUrl: string;
  file: File | string;
};

export type UseFilesPreviewReturn = {
  filesPreview: FilePreviewItem[];
};

export function useFilesPreview(files: (File | string)[]): UseFilesPreviewReturn {
  const filesPreview = useMemo<FilePreviewItem[]>(
    () =>
      files.map((file) => ({
        file,
        previewUrl: file instanceof File ? objectUrlFor(file) : file,
      })),
    [files]
  );

  return { filesPreview };
}
