import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../context/AppContext";
import { BottomSheet } from "./Sheet";
import { NOTE_COLOR_KEYS, noteSwatchHex } from "../theme/colors";
import { SortKey, Folder } from "../db/types";
import { createFolder, listFolders } from "../db/repo";

// ---------- Color picker ----------

export function ColorPickerSheet({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}) {
  const c = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Note color" testID="color-sheet">
      <View style={styles.colorGrid}>
        {NOTE_COLOR_KEYS.map((key) => {
          const active = current === key;
          return (
            <Pressable
              key={key}
              testID={`color-${key}`}
              onPress={() => {
                onSelect(key);
                onClose();
              }}
              style={[
                styles.colorDot,
                {
                  backgroundColor: noteSwatchHex(key),
                  borderColor: active ? c.brand : c.border,
                  borderWidth: active ? 3 : 1,
                },
              ]}
            >
              {key === "default" ? (
                <MaterialCommunityIcons name="format-color-fill" size={18} color="#fff" />
              ) : null}
              {active ? (
                <View style={styles.checkWrap}>
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

// ---------- Sort picker ----------

const SORT_OPTIONS: { key: SortKey; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: "updated", label: "Recently updated", icon: "clock-outline" },
  { key: "newest", label: "Newest first", icon: "sort-calendar-descending" },
  { key: "oldest", label: "Oldest first", icon: "sort-calendar-ascending" },
  { key: "az", label: "Title A – Z", icon: "sort-alphabetical-ascending" },
  { key: "za", label: "Title Z – A", icon: "sort-alphabetical-descending" },
];

export function SortSheet({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: SortKey;
  onSelect: (key: SortKey) => void;
  onClose: () => void;
}) {
  const c = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Sort by" testID="sort-sheet">
      {SORT_OPTIONS.map((o) => {
        const active = current === o.key;
        return (
          <Pressable
            key={o.key}
            testID={`sort-${o.key}`}
            onPress={() => {
              onSelect(o.key);
              onClose();
            }}
            style={styles.row}
          >
            <MaterialCommunityIcons name={o.icon} size={20} color={active ? c.brand : c.onSurfaceTertiary} />
            <Text style={[styles.rowText, { color: active ? c.brand : c.onSurface, fontWeight: active ? "700" : "500" }]}>
              {o.label}
            </Text>
            {active ? <MaterialCommunityIcons name="check" size={20} color={c.brand} /> : null}
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}

// ---------- Folder picker ----------

export function FolderPickerSheet({
  visible,
  currentFolderId,
  onSelect,
  onClose,
  reloadKey,
}: {
  visible: boolean;
  currentFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  onClose: () => void;
  reloadKey?: number;
}) {
  const c = useTheme();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (visible) listFolders().then(setFolders);
  }, [visible, reloadKey]);

  const addFolder = async () => {
    const name = newName.trim();
    if (!name) return;
    const f = await createFolder(name);
    setNewName("");
    setFolders(await listFolders());
    onSelect(f.id);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Move to folder" testID="folder-sheet">
      <Pressable testID="folder-none" onPress={() => { onSelect(null); onClose(); }} style={styles.row}>
        <MaterialCommunityIcons name="folder-off-outline" size={20} color={c.onSurfaceTertiary} />
        <Text style={[styles.rowText, { color: c.onSurface }]}>No folder</Text>
        {currentFolderId === null ? <MaterialCommunityIcons name="check" size={20} color={c.brand} /> : null}
      </Pressable>
      {folders.map((f) => {
        const active = currentFolderId === f.id;
        return (
          <Pressable key={f.id} testID={`folder-opt-${f.id}`} onPress={() => { onSelect(f.id); onClose(); }} style={styles.row}>
            <MaterialCommunityIcons name="folder-outline" size={20} color={active ? c.brand : c.onSurfaceTertiary} />
            <Text style={[styles.rowText, { color: active ? c.brand : c.onSurface }]} numberOfLines={1}>{f.name}</Text>
            {active ? <MaterialCommunityIcons name="check" size={20} color={c.brand} /> : null}
          </Pressable>
        );
      })}
      <View style={[styles.newRow, { borderColor: c.border }]}>
        <TextInput
          testID="new-folder-input"
          value={newName}
          onChangeText={setNewName}
          placeholder="New folder name"
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.onSurface, backgroundColor: c.surfaceTertiary }]}
          onSubmitEditing={addFolder}
          returnKeyType="done"
        />
        <Pressable testID="add-folder-button" onPress={addFolder} style={[styles.addBtn, { backgroundColor: c.brand }]}>
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, paddingVertical: 8, justifyContent: "center" },
  colorDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  checkWrap: {
    position: "absolute",
    right: -2,
    bottom: -2,
    backgroundColor: "#00000055",
    borderRadius: 12,
    padding: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  rowText: { fontSize: 15, flex: 1 },
  newRow: { flexDirection: "row", gap: 10, marginTop: 10, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, height: 46, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
  addBtn: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
