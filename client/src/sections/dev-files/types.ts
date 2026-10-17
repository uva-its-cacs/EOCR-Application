// Matches DevBlobItemDto and DevBlobListingDto (dev-only blob storage proof of concept).
export type DevBlobItem = {
  path: string;
  name: string;
  isFolder: boolean;
  size: number;
  contentType: string;
  modifiedAt: string | null;
};

export type DevBlobListing = {
  prefix: string;
  items: DevBlobItem[];
};
