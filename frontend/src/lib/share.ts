import { Share } from "react-native";
import * as Sharing from "expo-sharing";

import { ChecklistItem, Note } from "../db/types";

/**
 * Build a clean, plain-text representation of a note. Fully offline and safe
 * for any Unicode (Hindi, emoji, etc.) — JS strings are UTF-16 throughout.
 */
export function buildNoteText(
  note: Pick<Note, "title" | "content" | "type">,
  items: ChecklistItem[] = [],
): string {
  const parts: string[] = [];
  const title = (note.title || "").trim();
  if (title) parts.push(title);

  if (note.type === "checklist") {
    const lines = items
      .map((i) => `${i.isCompleted ? "\u2611" : "\u2610"} ${(i.text || "").trim()}`.trimEnd())
      .filter((l) => l.length > 1);
    if (lines.length) parts.push(lines.join("\n"));
  } else {
    const body = (note.content || "").trim();
    if (body) parts.push(body);
  }

  return parts.join("\n\n").trim();
}

export type ShareTextResult = "shared" | "dismissed" | "empty";

/**
 * Share note text via the native OS share sheet. Never throws; returns a
 * status the caller can turn into user-friendly feedback.
 */
export async function shareNoteAsText(
  note: Pick<Note, "title" | "content" | "type">,
  items: ChecklistItem[] = [],
): Promise<ShareTextResult> {
  const message = buildNoteText(note, items);
  if (!message) return "empty";
  const result = await Share.share({
    message,
    title: (note.title || "Note").trim() || "Note",
  });
  if (result.action === Share.dismissedAction) return "dismissed";
  return "shared";
}

/**
 * Share a generated image file (PNG) using expo-sharing. Returns false when
 * sharing is unavailable on the platform.
 */
export async function shareImageFile(uri: string): Promise<boolean> {
  const available = await Sharing.isAvailableAsync();
  if (!available) return false;
  await Sharing.shareAsync(uri, {
    mimeType: "image/png",
    dialogTitle: "Share note",
    UTI: "public.png",
  });
  return true;
}
