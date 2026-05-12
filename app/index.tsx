import { Redirect } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../src/theme";

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
