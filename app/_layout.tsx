import { AuthContext, AuthProvider } from "@/src/service/auth";
import { Stack } from "expo-router";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";

function RootLayout() {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {token ? <Stack.Screen name="home" /> : <Stack.Screen name="index" />}
    </Stack>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}
