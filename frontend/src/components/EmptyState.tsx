import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../context/AppContext";

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  testID?: string;
}

export function EmptyState({ icon, title, subtitle, testID }: EmptyStateProps) {
  const c = useTheme();
  return (
    <View style={styles.wrap} testID={testID}>
      <View style={[styles.iconWrap, { backgroundColor: c.brandTertiary }]}>
        <MaterialCommunityIcons name={icon} size={40} color={c.brand} />
      </View>
      <Text style={[styles.title, { color: c.onSurface }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: c.onSurfaceTertiary }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20, textAlign: "center" },
});
