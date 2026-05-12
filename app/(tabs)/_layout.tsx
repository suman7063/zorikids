import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { Colors } from "../../src/theme";
import { useSettingsStore } from "../../src/stores/settingsStore";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <Text style={{ fontSize: focused ? 26 : 22 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? "700" : "500",
          color: focused ? Colors.light.primary : Colors.light.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const isDark = useSettingsStore((s) => s.isDarkMode);
  const palette = isDark ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.tabBar,
          borderTopColor: palette.tabBarBorder,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📚" label="Learn" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏆" label="Rewards" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Me" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
