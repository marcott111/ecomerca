import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/**
 * Guarda una imagen subida en public/uploads y devuelve su URL pública.
 */
export async function guardarImagen(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const ext = EXT_BY_MIME[mimeType] || "jpg";
  const nombre = `${crypto.randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, nombre), buffer);
  return `/uploads/${nombre}`;
}

export function esImagenValida(mimeType: string): boolean {
  return Boolean(EXT_BY_MIME[mimeType]);
}
