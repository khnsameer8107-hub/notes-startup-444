import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../context/AppContext";

type ToastType = "info" | "success" | "error";

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string, t: ToastType = "info") => {
      setMessage(msg);
      setType(t);
      setVisible(true);
    },
    [],
  );

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setVisible(false));
    }, 2400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [visible, message, opacity, translateY]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {visible && (
        <ToastView message={message} type={type} opacity={opacity} translateY={translateY} />
      )}
    </ToastContext.Provider>
  );
}

function ToastView({
  message,
  type,
  opacity,
  translateY,
}: {
  message: string;
  type: ToastType;
  opacity: Animated.Value;
  translateY: Animated.Value;
}) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const icon =
    type === "success"
      ? "check-circle"
      : type === "error"
        ? "alert-circle"
        : "information";
  const iconColor =
    type === "success" ? c.success : type === "error" ? c.error : c.brand;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toastWrap,
        { bottom: insets.bottom + 90, opacity, transform: [{ translateY }] },
      ]}
    >
      <View
        style={[
          styles.toast,
          { backgroundColor: c.surfaceInverse },
        ]}
      >
        <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
        <Text style={[styles.toastText, { color: c.onSurfaceInverse }]} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  toastWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    maxWidth: "100%",
  },
  toastText: { fontSize: 14, fontWeight: "600", flexShrink: 1 },
});
