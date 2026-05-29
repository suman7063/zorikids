import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useAgeTheme } from "../../src/hooks/useAgeTheme";

function TabIcon({ emoji, label, focused, color }: {
  emoji: string; label: string; focused: boolean; color: string;
}) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <Text style={{ fontSize: focused ? 28 : 22 }}>{emoji}</Text>
      <Text style={{
        fontSize: 10, fontWeight: focused ? "800" : "500",
        color: focused ? color : "#9CA3AF",
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { world, theme } = useAgeTheme();
  const primary = theme.colors.primary;
  const isBaby  = world === "baby";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: theme.colors.border,
          borderTopWidth: 2,
          height: 82,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      {/* ── Home — always visible ── */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} color={primary} />
          ),
        }}
      />

      {/* ── Animals — Baby World only ── */}
      <Tabs.Screen
        name="animals"
        options={{
          href: isBaby ? "/animals" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🐾" label="Animals" focused={focused} color={primary} />
          ),
        }}
      />

      {/* ── Colors — Baby World only ── */}
      <Tabs.Screen
        name="colors"
        options={{
          href: isBaby ? "/colors" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🌈" label="Colors" focused={focused} color={primary} />
          ),
        }}
      />

      {/* ── Learn — Explorer & Champion only ── */}
      <Tabs.Screen
        name="learn"
        options={{
          href: !isBaby ? "/learn" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📚" label="Learn" focused={focused} color={primary} />
          ),
        }}
      />

      {/* ── Rewards — Explorer & Champion only ── */}
      <Tabs.Screen
        name="rewards"
        options={{
          href: !isBaby ? "/rewards" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏆" label="Rewards" focused={focused} color={primary} />
          ),
        }}
      />

      {/* ── Profile — always visible ── */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} color={primary} />
          ),
        }}
      />
    </Tabs>
  );
}
