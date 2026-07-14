import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import { colors } from "@/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandText,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Balance",
          tabBarIcon: ({ color }) => (
            <Feather name="dollar-sign" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="purchases/index"
        options={{
          title: "Purchases",
          tabBarIcon: ({ color }) => (
            <Feather name="list" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="purchases/new"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => (
            <Feather name="plus" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="purchases/[purchaseId]/edit"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
