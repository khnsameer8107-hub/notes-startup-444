// Web implementation of backup/restore backed by the AsyncStorage web store.
import { writeCacheFile } from "./files";
import { nowIso } from "./id";
import { webDump, webMergeAll, webReplaceAll } from "../db/repo.web";

const BACKUP_FORMAT = "notes_backup";
const BACKUP_VERSION = 1;

export async function createBackupFile(): Promise<string> {
  const db = await webDump();
  const payload = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: nowIso(),
    data: {
      notes: db.notes,
      checklist_items: db.checklist,
      folders: db.folders,
      labels: db.labels,
      note_labels: db.noteLabels,
      attachments: [],
    },
  };
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const fileName = `notes_backup_v${BACKUP_VERSION}_${stamp}.json`;
  return writeCacheFile(fileName, JSON.stringify(payload));
}

export interface ParsedBackup {
  data: {
    notes: any[];
    checklist_items: any[];
    folders: any[];
    labels: any[];
    note_labels: any[];
    attachments: any[];
  };
}

export function validateBackup(raw: string): ParsedBackup | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.format !== BACKUP_FORMAT) return null;
    const d = parsed.data;
    if (!d || !Array.isArray(d.notes) || !Array.isArray(d.folders)) return null;
    return {
      data: {
        notes: d.notes ?? [],
        checklist_items: d.checklist_items ?? [],
        folders: d.folders ?? [],
        labels: d.labels ?? [],
        note_labels: d.note_labels ?? [],
        attachments: d.attachments ?? [],
      },
    };
  } catch {
    return null;
  }
}

function toShape(p: ParsedBackup) {
  return {
    notes: p.data.notes,
    checklist: p.data.checklist_items,
    folders: p.data.folders,
    labels: p.data.labels,
    noteLabels: p.data.note_labels,
    attachments: [],
  } as any;
}

export async function restoreReplace(parsed: ParsedBackup): Promise<void> {
  await webReplaceAll(toShape(parsed));
}

export async function restoreMerge(parsed: ParsedBackup): Promise<void> {
  await webMergeAll(toShape(parsed));
}

export async function copyIntoStore(): Promise<{ path: string; size: number }> {
  return { path: "", size: 0 };
}
