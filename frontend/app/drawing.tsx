import React, { useRef, useState } from "react";
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, useTheme } from "@/src/context/AppContext";
import { useToast } from "@/src/components/Toast";
import { addAttachment, deleteAttachment } from "@/src/db/repo";
import { writeTextIntoStore } from "@/src/lib/files";

interface Stroke {
  d: string;
  color: string;
  width: number;
}

const PEN_COLORS = ["#181715", "#E27429", "#962D24", "#225937", "#183354"];
const SIZES = [3, 6, 12];
const CANVAS_BG = "#FFFFFF";

export default function Drawing() {
  const c = useTheme();
  const { refresh } = useApp();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ noteId: string; attachmentId?: string }>();

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [eraser, setEraser] = useState(false);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const currentRef = useRef("");
  const activeColor = eraser ? CANVAS_BG : penColor;
  const activeWidth = eraser ? size * 3 : size;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        currentRef.current = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        setCurrent(currentRef.current);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        currentRef.current += ` L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        setCurrent(currentRef.current);
      },
      onPanResponderRelease: () => {
        const d = currentRef.current;
        currentRef.current = "";
        setCurrent("");
        if (d.includes("L")) {
          setStrokes((prev) => [...prev, { d, color: colorRef.current, width: widthRef.current }]);
          setRedoStack([]);
        }
      },
    }),
  ).current;

  // keep latest color/width available inside PanResponder closure
  const colorRef = useRef(activeColor);
  const widthRef = useRef(activeWidth);
  colorRef.current = activeColor;
  widthRef.current = activeWidth;

  const undo = () => {
    setStrokes((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      setRedoStack((r) => [...r, last]);
      return prev.slice(0, -1);
    });
  };
  const redo = () => {
    setRedoStack((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      setStrokes((s) => [...s, last]);
      return prev.slice(0, -1);
    });
  };
  const clear = () => {
    setStrokes([]);
    setRedoStack([]);
    setCurrent("");
  };

  const save = async () => {
    if (strokes.length === 0) {
      router.back();
      return;
    }
    try {
      const w = dims.w || 300;
      const h = dims.h || 400;
      const paths = strokes
        .map(
          (s) =>
            `<path d="${s.d}" stroke="${s.color}" stroke-width="${s.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
        )
        .join("");
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${CANVAS_BG}"/>${paths}</svg>`;
      const saved = await writeTextIntoStore(svg, "svg");
      if (params.attachmentId) await deleteAttachment(params.attachmentId);
      await addAttachment(params.noteId, "drawing", saved.path, "drawing.svg", saved.size, null);
      refresh();
      toast.show("Drawing saved", "success");
      router.back();
    } catch {
      toast.show("Could not save drawing", "error");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.surface, paddingTop: insets.top }}>
      <View style={styles.header}>
        <Pressable testID="drawing-back" onPress={() => router.back()} style={styles.hBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.onSurface} />
        </Pressable>
        <Text style={[styles.hTitle, { color: c.onSurface }]}>Drawing</Text>
        <View style={styles.hRight}>
          <Pressable testID="drawing-undo" onPress={undo} style={styles.hBtn}>
            <MaterialCommunityIcons name="undo" size={22} color={strokes.length ? c.onSurface : c.muted} />
          </Pressable>
          <Pressable testID="drawing-redo" onPress={redo} style={styles.hBtn}>
            <MaterialCommunityIcons name="redo" size={22} color={redoStack.length ? c.onSurface : c.muted} />
          </Pressable>
          <Pressable testID="drawing-save" onPress={save} style={styles.hBtn}>
            <MaterialCommunityIcons name="check" size={24} color={c.brand} />
          </Pressable>
        </View>
      </View>

      <View
        testID="drawing-canvas"
        style={styles.canvas}
        onLayout={(e) => setDims({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        {...pan.panHandlers}
      >
        <Svg width="100%" height="100%">
          {strokes.map((s, i) => (
            <Path key={i} d={s.d} stroke={s.color} strokeWidth={s.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {current ? (
            <Path d={current} stroke={activeColor} strokeWidth={activeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </Svg>
      </View>

      <View style={[styles.tools, { backgroundColor: c.surfaceSecondary, borderColor: c.border, paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.toolGroup}>
          {PEN_COLORS.map((col) => (
            <Pressable
              key={col}
              testID={`pen-color-${col}`}
              onPress={() => { setPenColor(col); setEraser(false); }}
              style={[styles.colorDot, { backgroundColor: col, borderColor: !eraser && penColor === col ? c.brand : "transparent" }]}
            />
          ))}
        </View>
        <View style={styles.toolGroup}>
          {SIZES.map((sz) => (
            <Pressable key={sz} testID={`pen-size-${sz}`} onPress={() => setSize(sz)} style={[styles.sizeBtn, { borderColor: size === sz ? c.brand : c.border }]}>
              <View style={{ width: sz + 2, height: sz + 2, borderRadius: 99, backgroundColor: c.onSurface }} />
            </Pressable>
          ))}
          <Pressable testID="tool-eraser" onPress={() => setEraser((e) => !e)} style={[styles.sizeBtn, { borderColor: eraser ? c.brand : c.border }]}>
            <MaterialCommunityIcons name="eraser" size={18} color={eraser ? c.brand : c.onSurface} />
          </Pressable>
          <Pressable testID="tool-clear" onPress={clear} style={[styles.sizeBtn, { borderColor: c.border }]}>
            <MaterialCommunityIcons name="delete-outline" size={18} color={c.error} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, height: 52 },
  hBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  hTitle: { fontSize: 17, fontWeight: "700" },
  hRight: { flexDirection: "row", alignItems: "center" },
  canvas: { flex: 1, margin: 12, borderRadius: 16, backgroundColor: CANVAS_BG, overflow: "hidden" },
  tools: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, gap: 12 },
  toolGroup: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 16 },
  colorDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 3 },
  sizeBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});
