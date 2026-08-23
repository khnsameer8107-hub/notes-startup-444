import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../context/AppContext";
import { BottomSheet } from "./Sheet";
import {
  createLabel,
  getNoteLabels,
  listLabels,
  setNoteLabels,
} from "../db/repo";
import { Label } from "../db/types";

export function LabelPickerSheet({
  visible,
  noteId,
  onClose,
  onChanged,
}: {
  visible: boolean;
  noteId: string;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const c = useTheme();
  const [labels, setLabels] = useState<Label[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLabels(await listLabels());
      const current = await getNoteLabels(noteId);
      setSelected(new Set(current.map((l) => l.id)));
    })();
  }, [visible, noteId]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    const l = await createLabel(name);
    setNewName("");
    setLabels(await listLabels());
    setSelected((prev) => new Set(prev).add(l.id));
  };

  const save = async () => {
    await setNoteLabels(noteId, Array.from(selected));
    onChanged?.();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={save} title="Labels" testID="label-sheet">
      <View style={[styles.newRow, { borderColor: c.border }]}>
        <MaterialCommunityIcons name="pound" size={18} color={c.muted} />
        <TextInput
          testID="new-label-input"
          value={newName}
          onChangeText={setNewName}
          placeholder="Create new label"
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.onSurface }]}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <Pressable testID="add-label-button" onPress={add} style={[styles.addBtn, { backgroundColor: c.brand }]}>
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {labels.length === 0 ? (
        <Text style={[styles.empty, { color: c.muted }]}>No labels yet. Create one above.</Text>
      ) : (
        labels.map((l) => {
          const active = selected.has(l.id);
          return (
            <Pressable key={l.id} testID={`label-opt-${l.id}`} onPress={() => toggle(l.id)} style={styles.row}>
              <MaterialCommunityIcons
                name={active ? "checkbox-marked" : "checkbox-blank-outline"}
                size={22}
                color={active ? c.brand : c.muted}
              />
              <Text style={[styles.rowText, { color: c.onSurface }]}>#{l.name}</Text>
            </Pressable>
          );
        })
      )}

      <Pressable testID="labels-done" onPress={save} style={[styles.doneBtn, { backgroundColor: c.brand }]}>
        <Text style={styles.doneText}>Done</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  newRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, height: 44, fontSize: 15 },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowText: { fontSize: 15 },
  empty: { fontSize: 14, textAlign: "center", paddingVertical: 20 },
  doneBtn: { height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 12 },
  doneText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
