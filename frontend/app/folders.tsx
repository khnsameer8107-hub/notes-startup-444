import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/context/AppContext";
import { useToast } from "@/src/components/Toast";
import { EmptyState } from "@/src/components/EmptyState";
import { BottomSheet, ConfirmSheet } from "@/src/components/Sheet";
import {
  createFolder,
  deleteFolder,
  listFolders,
  renameFolder,
} from "@/src/db/repo";
import { Folder } from "@/src/db/types";

export default function Folders() {
  const c = useTheme();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<Folder | null>(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState<Folder | null>(null);

  const load = useCallback(() => {
    listFolders().then(setFolders);
  }, []);
  useFocusEffect(load);

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    await createFolder(name);
    setNewName("");
    load();
    toast.show("Folder created", "success");
  };

  const saveRename = async () => {
    if (!editing) return;
    const name = editName.trim();
    if (name) await renameFolder(editing.id, name);
    setEditing(null);
    load();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await deleteFolder(deleting.id);
    setDeleting(null);
    load();
    toast.show("Folder deleted", "success");
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingTop: insets.top }}>
      <View style={styles.header}>
        <Pressable testID="folders-back" onPress={() => router.back()} style={styles.hBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.onSurface} />
        </Pressable>
        <Text style={[styles.hTitle, { color: c.onSurface }]}>Folders</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.addRow}>
        <View style={[styles.inputWrap, { backgroundColor: c.surfaceTertiary, borderColor: c.border }]}>
          <MaterialCommunityIcons name="folder-plus-outline" size={20} color={c.muted} />
          <TextInput
            testID="folder-name-input"
            value={newName}
            onChangeText={setNewName}
            placeholder="New folder name"
            placeholderTextColor={c.muted}
            style={[styles.input, { color: c.onSurface }]}
            onSubmitEditing={add}
            returnKeyType="done"
          />
        </View>
        <Pressable testID="folder-create-button" onPress={add} style={[styles.addBtn, { backgroundColor: c.brand }]}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </Pressable>
      </View>

      {folders.length === 0 ? (
        <EmptyState icon="folder-outline" title="No folders yet" subtitle="Create a folder to organize your notes." testID="empty-folders" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
          {folders.map((f) => (
            <Pressable
              key={f.id}
              testID={`folder-row-${f.id}`}
              onPress={() => router.push({ pathname: "/folder/[id]", params: { id: f.id, name: f.name } })}
              style={[styles.row, { backgroundColor: c.surfaceSecondary, borderColor: c.border }]}
            >
              <View style={[styles.folderIcon, { backgroundColor: c.brandTertiary }]}>
                <MaterialCommunityIcons name="folder" size={22} color={c.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.folderName, { color: c.onSurface }]} numberOfLines={1}>{f.name}</Text>
                <Text style={[styles.folderCount, { color: c.muted }]}>{f.noteCount ?? 0} notes</Text>
              </View>
              <Pressable testID={`folder-edit-${f.id}`} onPress={() => { setEditing(f); setEditName(f.name); }} style={styles.rowBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color={c.onSurfaceTertiary} />
              </Pressable>
              <Pressable testID={`folder-delete-${f.id}`} onPress={() => setDeleting(f)} style={styles.rowBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={c.error} />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <BottomSheet visible={!!editing} onClose={() => setEditing(null)} title="Rename folder" testID="rename-folder-sheet">
        <TextInput
          testID="rename-folder-input"
          value={editName}
          onChangeText={setEditName}
          style={[styles.renameInput, { color: c.onSurface, backgroundColor: c.surfaceTertiary }]}
          autoFocus
        />
        <Pressable testID="rename-folder-save" onPress={saveRename} style={[styles.saveBtn, { backgroundColor: c.brand }]}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </BottomSheet>

      <ConfirmSheet
        visible={!!deleting}
        title="Delete folder?"
        message="Notes inside will be kept and moved out of this folder."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, height: 52 },
  hBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  hTitle: { fontSize: 18, fontWeight: "700" },
  addRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 50, borderRadius: 14, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, fontSize: 15 },
  addBtn: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: StyleSheet.hairlineWidth },
  folderIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  folderName: { fontSize: 15, fontWeight: "700" },
  folderCount: { fontSize: 12, marginTop: 2 },
  rowBtn: { padding: 8 },
  renameInput: { height: 50, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, marginBottom: 12 },
  saveBtn: { height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
