import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, useTheme } from "@/src/context/AppContext";
import { EmptyState } from "@/src/components/EmptyState";
import { NotesGrid } from "@/src/components/NotesGrid";
import { listNotes } from "@/src/db/repo";
import { NoteListItem } from "@/src/db/types";

export default function FolderView() {
  const c = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, dataVersion } = useApp();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [notes, setNotes] = useState<NoteListItem[]>([]);

  const load = useCallback(() => {
    listNotes({ filter: "all", folderId: id, sort: settings.sort }).then(setNotes);
  }, [id, settings.sort]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, dataVersion]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingTop: insets.top }}>
      <View style={styles.header}>
        <Pressable testID="folder-view-back" onPress={() => router.back()} style={styles.hBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.onSurface} />
        </Pressable>
        <Text style={[styles.hTitle, { color: c.onSurface }]} numberOfLines={1}>{name || "Folder"}</Text>
        <View style={{ width: 40 }} />
      </View>

      {notes.length === 0 ? (
        <EmptyState icon="folder-open-outline" title="Folder is empty" subtitle="Move notes into this folder to see them here." testID="empty-folder-view" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
          <NotesGrid
            notes={notes}
            layout={settings.layout}
            showPreview={settings.showPreviews}
            onPressNote={(n) => router.push({ pathname: "/editor", params: { id: n.id } })}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, height: 52 },
  hBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  hTitle: { fontSize: 18, fontWeight: "700", flex: 1, textAlign: "center" },
});
