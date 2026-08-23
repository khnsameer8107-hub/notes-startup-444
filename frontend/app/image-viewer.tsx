import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ImageViewer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [error, setError] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        testID="image-viewer-close"
        onPress={() => router.back()}
        style={[styles.close, { top: insets.top + 8 }]}
      >
        <MaterialCommunityIcons name="close" size={26} color="#fff" />
      </Pressable>
      {error ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="image-broken-variant" size={48} color="#888" />
          <Text style={styles.errText}>Image is unavailable</Text>
        </View>
      ) : (
        <Image
          testID="image-viewer-image"
          source={{ uri }}
          style={styles.image}
          contentFit="contain"
          onError={() => setError(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  image: { flex: 1 },
  close: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errText: { color: "#888", fontSize: 15 },
});
