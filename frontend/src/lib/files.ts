import * as FileSystem from "expo-file-system/legacy";

import { genId } from "./id";

const ATTACH_DIR = FileSystem.documentDirectory + "attachments/";

async function ensureDir(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(ATTACH_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(ATTACH_DIR, { intermediates: true });
    }
  } catch {
    // ignore
  }
}

export interface SavedFile {
  path: string;
  size: number;
}

// Copy an external uri (camera/gallery/recording) into app storage.
export async function copyIntoStore(
  srcUri: string,
  ext: string,
): Promise<SavedFile> {
  await ensureDir();
  const dest = `${ATTACH_DIR}${genId("f")}.${ext}`;
  await FileSystem.copyAsync({ from: srcUri, to: dest });
  const info = await FileSystem.getInfoAsync(dest);
  return { path: dest, size: info.exists && !info.isDirectory ? info.size ?? 0 : 0 };
}

// Write text content (e.g. SVG drawing) into app storage.
export async function writeTextIntoStore(
  content: string,
  ext: string,
): Promise<SavedFile> {
  await ensureDir();
  const dest = `${ATTACH_DIR}${genId("f")}.${ext}`;
  await FileSystem.writeAsStringAsync(dest, content);
  const info = await FileSystem.getInfoAsync(dest);
  return { path: dest, size: info.exists && !info.isDirectory ? info.size ?? 0 : 0 };
}

export async function readTextFile(path: string): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;
    return await FileSystem.readAsStringAsync(path);
  } catch {
    return null;
  }
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
  } catch {
    return false;
  }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(path, { idempotent: true });
  } catch {
    // ignore
  }
}

// Write an arbitrary export/backup file to cache for sharing.
export async function writeCacheFile(
  fileName: string,
  content: string,
): Promise<string> {
  const dest = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(dest, content);
  return dest;
}

export async function readAnyFile(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri);
}

export async function totalAttachmentBytes(): Promise<number> {
  try {
    await ensureDir();
    const names = await FileSystem.readDirectoryAsync(ATTACH_DIR);
    let total = 0;
    for (const name of names) {
      const info = await FileSystem.getInfoAsync(ATTACH_DIR + name);
      if (info.exists && !info.isDirectory) total += info.size ?? 0;
    }
    return total;
  } catch {
    return 0;
  }
}
