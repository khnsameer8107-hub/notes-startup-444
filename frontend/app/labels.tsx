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
import { createLabel, deleteLabel, listLabels, renameLabel } from "@/src/db/repo";
import { Label } from "@/src/db/types";

export default function Labels() {
  const c = useTheme();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [labels, setLabels] = useState<Label[]>([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<Label | null>(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState<Label | null>(null);

  const load = useCallback(() => {
    listLabels()
      .then(setLabels)
      .catch((e) => {
        console.warn("[Labels] load failed", e);
        setLabels([]);
      });
  }, []);
  useFocusEffect(load);

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await createLabel(name);
      setNewName("");
      load();
      toast.show("Label created", "success");
    } catch (e) {
      console.warn("[Labels] create failed", e);
      toast.show("Couldn't create label", "error");
    }
  };

  const saveRename = async () => {
    if (!editing) return;
    const name = editName.trim();
    try {
      if (name) await renameLabel(editing.id, name);
      setEditing(null);
      load();
    } catch (e) {
      console.warn("[Labels] rename failed", e);
      setEditing(null);
      toast.show("Couldn't rename label", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteLabel(deleting.id);
      setDeleting(null);
      load();
      toast.show("Label deleted", "success");
    } catch (e) {
      console.warn("[Labels] delete failed", e);
      setDeleting(null);
      toast.show("Couldn't delete label", "error");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingTop: insets.top }}>
      <View style={styles.header}>
        <Pressable testID="labels-back" onPress={() => router.back()} style={styles.hBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.onSurface} />
        </Pressable>
        <Text style={[styles.hTitle, { color: c.onSurface }]}>Labels</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.addRow}>
        <View style={[styles.inputWrap, { backgroundColor: c.surfaceTertiary, borderColor: c.border }]}>
          <MaterialCommunityIcons name="pound" size={20} color={c.muted} />
          <TextInput
            testID="label-name-input"
            value={newName}
            onChangeText={setNewName}
            placeholder="New label name"
            placeholderTextColor={c.muted}
            style={[styles.input, { color: c.onSurface }]}
            onSubmitEditing={add}
            returnKeyType="done"
          />
        </View>
        <Pressable testID="label-create-button" onPress={add} style={[styles.addBtn, { backgroundColor: c.brand }]}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </Pressable>
      </View>

      {labels.length === 0 ? (
        <EmptyState icon="tag-outline" title="No labels yet" subtitle="Create tags like #work or #ideas to organize notes." testID="empty-labels" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
          {labels.map((l) => (
            <Pressable
              key={l.id}
              testID={`label-row-${l.id}`}
              onPress={() => router.push({ pathname: "/label/[id]", params: { id: l.id, name: l.name } })}
              style={[styles.row, { backgroundColor: c.surfaceSecondary, borderColor: c.border }]}
            >
              <View style={[styles.labelIcon, { backgroundColor: c.brandTertiary }]}>
                <MaterialCommunityIcons name="tag" size={20} color={c.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.labelName, { color: c.onSurface }]} numberOfLines={1}>#{l.name}</Text>
                <Text style={[styles.labelCount, { color: c.muted }]}>{l.noteCount ?? 0} notes</Text>
              </View>
              <Pressable testID={`label-edit-${l.id}`} onPress={() => { setEditing(l); setEditName(l.name); }} style={styles.rowBtn}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color={c.onSurfaceTertiary} />
              </Pressable>
              <Pressable testID={`label-delete-${l.id}`} onPress={() => setDeleting(l)} style={styles.rowBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={c.error} />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <BottomSheet visible={!!editing} onClose={() => setEditing(null)} title="Rename label" testID="rename-label-sheet">
        <TextInput
          testID="rename-label-input"
          value={editName}
          onChangeText={setEditName}
          style={[styles.renameInput, { color: c.onSurface, backgroundColor: c.surfaceTertiary }]}
          autoFocus
        />
        <Pressable testID="rename-label-save" onPress={saveRename} style={[styles.saveBtn, { backgroundColor: c.brand }]}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </BottomSheet>

      <ConfirmSheet
        visible={!!deleting}
        title="Delete label?"
        message="This removes the label from all notes. The notes are kept."
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
  labelIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  labelName: { fontSize: 15, fontWeight: "700" },
  labelCount: { fontSize: 12, marginTop: 2 },
  rowBtn: { padding: 8 },
  renameInput: { height: 50, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, marginBottom: 12 },
  saveBtn: { height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
