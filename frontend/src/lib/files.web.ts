// Web-safe file helpers. On web there is no persistent app filesystem, so we
// keep text blobs (e.g. SVG drawings) in memory and pass through media URIs.
// Native uses files.ts with the real expo-file-system.
import { genId } from "./id";

const textStore = new Map<string, string>();

export interface SavedFile {
  path: string;
  size: number;
}

export async function copyIntoStore(srcUri: string): Promise<SavedFile> {
  // Reuse the picker/recorder URI directly (blob:/data: URLs work in-session).
  return { path: srcUri, size: 0 };
}

export async function writeTextIntoStore(content: string, ext: string): Promise<SavedFile> {
  const path = `webmem://${genId("f")}.${ext}`;
  textStore.set(path, content);
  return { path, size: content.length };
}

export async function readTextFile(path: string): Promise<string | null> {
  if (textStore.has(path)) return textStore.get(path)!;
  try {
    const res = await fetch(path);
    return await res.text();
  } catch {
    return null;
  }
}

export async function fileExists(path: string): Promise<boolean> {
  if (textStore.has(path)) return true;
  return /^(https?|blob|data|file):/.test(path);
}

export async function deleteFile(path: string): Promise<void> {
  textStore.delete(path);
}

export async function writeCacheFile(fileName: string, content: string): Promise<string> {
  const path = `webmem://cache/${fileName}`;
  textStore.set(path, content);
  return path;
}

export async function readAnyFile(uri: string): Promise<string> {
  if (textStore.has(uri)) return textStore.get(uri)!;
  const res = await fetch(uri);
  return res.text();
}

export async function totalAttachmentBytes(): Promise<number> {
  return 0;
}
