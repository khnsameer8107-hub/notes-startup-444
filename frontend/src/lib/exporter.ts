import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { getChecklist } from "../db/repo";
import { Note } from "../db/types";
import { writeCacheFile } from "./files";

export type ExportFormat = "txt" | "md" | "pdf";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function noteToTxt(note: Note): Promise<string> {
  let out = `${note.title || "Untitled"}\n${"=".repeat(
    (note.title || "Untitled").length,
  )}\n\n`;
  if (note.content) out += `${note.content}\n\n`;
  if (note.type === "checklist") {
    const items = await getChecklist(note.id);
    for (const i of items) {
      out += `[${i.isCompleted ? "x" : " "}] ${i.text}\n`;
    }
  }
  return out.trim() + "\n";
}

async function noteToMd(note: Note): Promise<string> {
  let out = `# ${note.title || "Untitled"}\n\n`;
  if (note.content) out += `${note.content}\n\n`;
  if (note.type === "checklist") {
    const items = await getChecklist(note.id);
    for (const i of items) {
      out += `- [${i.isCompleted ? "x" : " "}] ${i.text}\n`;
    }
  }
  return out.trim() + "\n";
}

async function noteToHtml(note: Note): Promise<string> {
  let body = escapeHtml(note.content).replace(/\n/g, "<br/>");
  let checklistHtml = "";
  if (note.type === "checklist") {
    const items = await getChecklist(note.id);
    checklistHtml =
      "<ul style='list-style:none;padding-left:0'>" +
      items
        .map(
          (i) =>
            `<li style='margin:6px 0'>${
              i.isCompleted ? "☑" : "☐"
            } <span style='${
              i.isCompleted ? "text-decoration:line-through;color:#999" : ""
            }'>${escapeHtml(i.text)}</span></li>`,
        )
        .join("") +
      "</ul>";
  }
  const date = new Date(note.updatedAt).toLocaleString();
  return `
    <div style="margin-bottom:36px;page-break-inside:avoid">
      <h1 style="font-size:22px;margin:0 0 4px 0;color:#181715">${escapeHtml(
        note.title || "Untitled",
      )}</h1>
      <div style="font-size:12px;color:#8A8781;margin-bottom:12px">${date}</div>
      <div style="font-size:15px;line-height:1.6;color:#333">${body}</div>
      ${checklistHtml}
    </div>`;
}

export async function exportNotes(
  notes: Note[],
  format: ExportFormat,
): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  if (format === "pdf") {
    const parts = await Promise.all(notes.map(noteToHtml));
    const html = `<html><head><meta charset="utf-8"/></head>
      <body style="font-family:-apple-system,Roboto,sans-serif;padding:32px">
      ${parts.join('<hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>')}
      </body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    if (available) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Export notes",
        UTI: "com.adobe.pdf",
      });
    }
    return;
  }

  const isMd = format === "md";
  const parts = await Promise.all(
    notes.map((n) => (isMd ? noteToMd(n) : noteToTxt(n))),
  );
  const content = parts.join(isMd ? "\n\n---\n\n" : "\n\n----------\n\n");
  const single = notes.length === 1;
  const base = single
    ? (notes[0].title || "note").replace(/[^a-z0-9]+/gi, "_").slice(0, 40)
    : `notes_${stamp}`;
  const fileName = `${base}.${isMd ? "md" : "txt"}`;
  const fileUri = await writeCacheFile(fileName, content);
  if (available) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/plain",
      dialogTitle: "Export notes",
    });
  }
}
