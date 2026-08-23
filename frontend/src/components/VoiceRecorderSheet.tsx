import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as Linking from "expo-linking";

import { useTheme } from "../context/AppContext";
import { BottomSheet } from "./Sheet";
import { useToast } from "./Toast";

function fmt(ms: number): string {
  const total = Math.floor((ms || 0) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceRecorderSheet({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: (uri: string, durationSec: number) => void;
}) {
  const c = useTheme();
  const toast = useToast();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const [started, setStarted] = useState(false);
  const [permDenied, setPermDenied] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    if (!visible) {
      setStarted(false);
      setPermDenied(false);
    }
  }, [visible]);

  const begin = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setPermDenied(true);
        busy.current = false;
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStarted(true);
    } catch {
      toast.show("Could not start recording", "error");
    }
    busy.current = false;
  };

  const togglePause = () => {
    try {
      if (state.isRecording) recorder.pause();
      else recorder.record();
    } catch {
      // ignore
    }
  };

  const finish = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      await recorder.stop();
      const uri = recorder.uri;
      const dur = Math.round((state.durationMillis || 0) / 1000);
      if (uri) onSaved(uri, dur);
      else toast.show("Recording was empty", "error");
    } catch {
      toast.show("Could not save recording", "error");
    }
    setStarted(false);
    busy.current = false;
    onClose();
  };

  const cancel = async () => {
    try {
      if (started) await recorder.stop();
    } catch {
      // ignore
    }
    setStarted(false);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={cancel} title="Voice note" testID="voice-sheet">
      {permDenied ? (
        <View style={styles.center}>
          <Text style={[styles.info, { color: c.onSurfaceTertiary }]}>
            Microphone access is needed to record voice notes.
          </Text>
          <Pressable testID="voice-settings" onPress={() => Linking.openSettings()} style={[styles.primaryBtn, { backgroundColor: c.brand }]}>
            <Text style={styles.primaryText}>Open Settings</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={[styles.timer, { color: c.onSurface }]}>{fmt(state.durationMillis)}</Text>
          <Text style={[styles.status, { color: c.muted }]}>
            {!started ? "Tap to start recording" : state.isRecording ? "Recording..." : "Paused"}
          </Text>
          <View style={styles.controls}>
            {!started ? (
              <Pressable testID="voice-start" onPress={begin} style={[styles.recBtn, { backgroundColor: c.error }]}>
                <MaterialCommunityIcons name="microphone" size={34} color="#fff" />
              </Pressable>
            ) : (
              <>
                <Pressable testID="voice-pause" onPress={togglePause} style={[styles.smallBtn, { backgroundColor: c.surfaceTertiary }]}>
                  <MaterialCommunityIcons name={state.isRecording ? "pause" : "play"} size={26} color={c.onSurface} />
                </Pressable>
                <Pressable testID="voice-stop" onPress={finish} style={[styles.recBtn, { backgroundColor: c.brand }]}>
                  <MaterialCommunityIcons name="check" size={34} color="#fff" />
                </Pressable>
                <Pressable testID="voice-cancel" onPress={cancel} style={[styles.smallBtn, { backgroundColor: c.surfaceTertiary }]}>
                  <MaterialCommunityIcons name="close" size={26} color={c.onSurface} />
                </Pressable>
              </>
            )}
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", paddingVertical: 20 },
  info: { fontSize: 14, textAlign: "center", marginBottom: 20, lineHeight: 20 },
  timer: { fontSize: 44, fontWeight: "800", fontVariant: ["tabular-nums"] },
  status: { fontSize: 14, marginTop: 6, marginBottom: 28 },
  controls: { flexDirection: "row", alignItems: "center", gap: 24 },
  recBtn: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  smallBtn: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  primaryBtn: { paddingHorizontal: 24, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
