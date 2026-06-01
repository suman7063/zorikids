import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useAgeTheme } from "../../src/hooks/useAgeTheme";

function TabIcon({ emoji, focused, color }: {
  emoji: string; label: string; focused: boolean; color: string;
}) {
  return (
    <View style={{
      alignItems: "center", justifyContent: "center",
      width: focused ? 44 : 36, height: focused ? 44 : 36,
      borderRadius: 22,
      backgroundColor: focused ? color + "20" : "transparent",
    }}>
      <Text style={{ fontSize: focused ? 26 : 22 }}>{emoji}</Text>
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
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 6,
          paddingTop: 6,
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

      {/* ── Alphabets — Baby World only ── */}
      <Tabs.Screen
        name="alphabets"
        options={{
          href: isBaby ? "/alphabets" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔤" label="ABC" focused={focused} color={primary} />
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
