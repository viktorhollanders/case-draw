"use server";

import { list } from "@vercel/blob";

export async function listGalleryImages() {
  // Fetch all blobs in your account
  const result = await list();
  return result.blobs; // [{url, pathname, size, uploadedAt}, ...]
}