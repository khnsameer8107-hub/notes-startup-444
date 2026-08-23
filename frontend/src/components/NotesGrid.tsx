import React from "react";
import { StyleSheet, View } from "react-native";

import { NoteListItem } from "../db/types";
import { NoteCard } from "./NoteCard";

interface NotesGridProps {
  notes: NoteListItem[];
  layout: "grid" | "list";
  showPreview: boolean;
  onPressNote: (note: NoteListItem) => void;
  onLongPressNote?: (note: NoteListItem) => void;
  selectedIds?: Set<string>;
}

export function NotesGrid({
  notes,
  layout,
  showPreview,
  onPressNote,
  onLongPressNote,
  selectedIds,
}: NotesGridProps) {
  if (layout === "list") {
    return (
      <View>
        {notes.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            showPreview={showPreview}
            onPress={() => onPressNote(n)}
            onLongPress={onLongPressNote ? () => onLongPressNote(n) : undefined}
            selected={selectedIds?.has(n.id)}
          />
        ))}
      </View>
    );
  }

  const left: NoteListItem[] = [];
  const right: NoteListItem[] = [];
  notes.forEach((n, i) => (i % 2 === 0 ? left : right).push(n));

  return (
    <View style={styles.row}>
      <View style={styles.col}>
        {left.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            showPreview={showPreview}
            onPress={() => onPressNote(n)}
            onLongPress={onLongPressNote ? () => onLongPressNote(n) : undefined}
            selected={selectedIds?.has(n.id)}
          />
        ))}
      </View>
      <View style={styles.col}>
        {right.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            showPreview={showPreview}
            onPress={() => onPressNote(n)}
            onLongPress={onLongPressNote ? () => onLongPressNote(n) : undefined}
            selected={selectedIds?.has(n.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
});
