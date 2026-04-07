import { AuthContext, AuthProvider } from "@/src/service/auth";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useContext } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function RootLayout() {
  const { token, loading, logout } = useContext(AuthContext);
  const router = useRouter();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
      </Stack>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#050805" }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            logout();
            router.replace("/");
          }}
        >
          <Ionicons name="log-out-outline" size={25} color="#00ff88" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/decklink-logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logo}>DECKLINK</Text>
        </View>

        <TouchableOpacity>
          <Ionicons name="menu" size={25} color="#00ff88" />
        </TouchableOpacity>
      </View>

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="lotes" />
        <Stack.Screen name="crear-carta" />
        <Stack.Screen name="lote-detalle" />
      </Stack>
    </View>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#00ff8830",
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  logoImage: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },

  logo: {
    color: "#00ff88",
    fontSize: 25,
    fontWeight: "bold",
    letterSpacing: 2,
  },
});
