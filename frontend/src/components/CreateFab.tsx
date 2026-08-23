import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../context/AppContext";

export type CreateType = "text" | "checklist" | "voice" | "image" | "drawing";

const OPTIONS: {
  type: CreateType;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { type: "text", label: "Text Note", icon: "text" },
  { type: "checklist", label: "Checklist", icon: "checkbox-marked-outline" },
  { type: "voice", label: "Voice Note", icon: "microphone" },
  { type: "image", label: "Image Note", icon: "image" },
  { type: "drawing", label: "Drawing Note", icon: "draw" },
];

export function CreateFab({ onSelect }: { onSelect: (t: CreateType) => void }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const bottom = insets.bottom + 20;

  const choose = (t: CreateType) => {
    setOpen(false);
    Haptics.selectionAsync();
    onSelect(t);
  };

  return (
    <>
      <Pressable
        testID="create-fab"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen(true);
        }}
        style={[styles.fab, { backgroundColor: c.brand, bottom, right: 20 }]}
      >
        <MaterialCommunityIcons name="plus" size={30} color={c.onBrand} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: c.overlay }]}
          onPress={() => setOpen(false)}
          testID="create-menu-backdrop"
        >
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(120)}
            style={[styles.menu, { bottom: bottom + 72, right: 20 }]}
          >
            {OPTIONS.map((o, i) => (
              <Animated.View key={o.type} entering={FadeInDown.delay(i * 40)}>
                <Pressable
                  testID={`create-option-${o.type}`}
                  onPress={() => choose(o.type)}
                  style={styles.optionRow}
                >
                  <View style={[styles.optionLabel, { backgroundColor: c.surfaceInverse }]}>
                    <Text style={[styles.optionText, { color: c.onSurfaceInverse }]}>
                      {o.label}
                    </Text>
                  </View>
                  <View style={[styles.optionIcon, { backgroundColor: c.surfaceSecondary, borderColor: c.border }]}>
                    <MaterialCommunityIcons name={o.icon} size={22} color={c.brand} />
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  backdrop: { flex: 1 },
  menu: { position: "absolute", alignItems: "flex-end", gap: 14 },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionLabel: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  optionText: { fontSize: 14, fontWeight: "600" },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
