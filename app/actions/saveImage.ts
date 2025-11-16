'use server';

import { put } from "@vercel/blob";

export async function saveImageAction(blob: Blob) {
  const saved = await put(`drawing-${Date.now()}.png`, blob, {
    access: "public",
    contentType: "image/png",
  });

  return saved; // contains saved.url
}