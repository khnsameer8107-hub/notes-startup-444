import React from "react";
import {
  Appearance,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * App-wide safety net. Any uncaught render/runtime error inside the tree is
 * caught here so the user sees a friendly recovery screen instead of a blank
 * white crash. "Try again" remounts the subtree. Fully offline, no network.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Log for debugging; never surfaced raw to the user.
    console.warn("[ErrorBoundary] caught error", error, info);
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const dark = Appearance.getColorScheme() === "dark";
    const bg = dark ? "#181715" : "#FAF9F7";
    const fg = dark ? "#E5E3E0" : "#181715";
    const muted = "#8A8781";
    const brand = "#E27429";
    const chip = dark ? "#3A2417" : "#FBE9DE";

    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View style={[styles.iconWrap, { backgroundColor: chip }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={44} color={brand} />
        </View>
        <Text style={[styles.title, { color: fg }]}>Something went wrong</Text>
        <Text style={[styles.subtitle, { color: muted }]}>
          Your notes are safe on this device. Try again to continue.
        </Text>
        <Pressable
          testID="error-retry-button"
          onPress={this.reset}
          style={[styles.button, { backgroundColor: brand }]}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 32, textAlign: "center" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    height: 52,
    borderRadius: 16,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
