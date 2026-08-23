import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { useTheme } from "../context/AppContext";

function fmt(sec: number): string {
  const total = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  uri,
  duration,
  onDelete,
}: {
  uri: string;
  duration: number | null;
  onDelete: () => void;
}) {
  const c = useTheme();
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);
  const [error, setError] = useState(false);

  useEffect(() => {
    return () => {
      try {
        player.remove();
      } catch {
        // ignore
      }
    };
  }, [player]);

  useEffect(() => {
    // Reset to start when playback completes.
    if (status.didJustFinish) {
      try {
        player.seekTo(0);
        player.pause();
      } catch {
        // ignore
      }
    }
  }, [status.didJustFinish, player]);

  const toggle = () => {
    try {
      if (status.playing) player.pause();
      else player.play();
    } catch {
      setError(true);
    }
  };

  const totalSec = duration ?? (status.duration || 0);
  const currentSec = status.currentTime || 0;
  const progress = totalSec > 0 ? Math.min(1, currentSec / totalSec) : 0;

  return (
    <View style={[styles.wrap, { backgroundColor: c.surfaceTertiary, borderColor: c.border }]}>
      <Pressable testID="audio-play" onPress={toggle} style={[styles.playBtn, { backgroundColor: c.brand }]}>
        <MaterialCommunityIcons name={status.playing ? "pause" : "play"} size={22} color="#fff" />
      </Pressable>
      <View style={styles.mid}>
        <View style={[styles.track, { backgroundColor: c.border }]}>
          <View style={[styles.fill, { backgroundColor: c.brand, width: `${progress * 100}%` }]} />
        </View>
        <Text style={[styles.time, { color: c.muted }]}>
          {error ? "Audio unavailable" : `${fmt(currentSec)} / ${fmt(totalSec)}`}
        </Text>
      </View>
      <Pressable testID="audio-delete" onPress={onDelete} style={styles.delBtn}>
        <MaterialCommunityIcons name="close" size={18} color={c.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  playBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  mid: { flex: 1, gap: 6 },
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
  time: { fontSize: 12, fontVariant: ["tabular-nums"] },
  delBtn: { padding: 6 },
});
