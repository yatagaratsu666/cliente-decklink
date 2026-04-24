import { AuthContext, AuthProvider } from "@/src/service/auth";
import socket from "@/src/service/socket";
import { getProfile } from "@/src/service/usuario";
import { User } from "@/src/types/usuario";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function RootLayout() {
  const { token, loading, logout } = useContext(AuthContext);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setMenuOpen(true);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.6,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogout = () => {
    socket.disconnect();
    logout();
    router.replace("/");
  };

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const data = await getProfile();

        if (isMounted) {
          setUser(data);
        }
      } catch (error: any) {
        if (
          error?.response?.status !== 401 &&
          error?.response?.status !== 403
        ) {
          console.log("Error cargando perfil", error);
        }
      }
    };

    if (token) loadUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setMenuOpen(false));
  };

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
            handleLogout();
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

        <TouchableOpacity onPress={openMenu}>
          <Ionicons name="menu" size={28} color="#00ff88" />
        </TouchableOpacity>
      </View>

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="lotes" />
        <Stack.Screen name="crear-carta" />
        <Stack.Screen name="lote-detalle" />
      </Stack>

      {menuOpen && (
        <View style={StyleSheet.absoluteFill}>
          <Animated.View style={[styles.overlayBg, { opacity: opacityAnim }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={closeMenu} />
          </Animated.View>

          <Animated.View
            style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}
          >
            <View style={styles.profileSection}>
              <Image
                source={{
                  uri:
                    user?.foto_perfil ||
                    "https://i.pinimg.com/736x/d3/22/48/d322487946b0c6c2deb0fcf38b77e963.jpg",
                }}
                style={styles.profileImage}
              />

              <View>
                <Text style={styles.profileName}>
                  {user?.nombre_usuario || "Usuario"}
                </Text>
                <Text style={styles.profileEmail}>
                  {user?.email || "correo@email.com"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push("/inicio");
                closeMenu();
              }}
            >
              <Ionicons name="home-outline" size={20} color="#00ff88" />
              <Text style={styles.menuText}>Inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (user?.id_usuario) {
                  router.push({
                    pathname: "/user-profile",
                    params: { id: user.id_usuario },
                  });
                } else {
                  router.push("/user-profile");
                }
                closeMenu();
              }}
            >
              <Ionicons name="person-outline" size={20} color="#00ff88" />
              <Text style={styles.menuText}>Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push("/home");
                closeMenu();
              }}
            >
              <Ionicons name="albums-outline" size={20} color="#00ff88" />
              <Text style={styles.menuText}>Inventario</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push("/lista-propuesta");
                closeMenu();
              }}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={20}
                color="#00ff88"
              />
              <Text style={styles.menuText}>Propuestas</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
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

const HEADER_HEIGHT = 100;

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#00ff8827",
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

  overlayBg: {
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },

  menu: {
    position: "absolute",
    right: 0,
    top: HEADER_HEIGHT,
    bottom: 0,
    width: 250,
    backgroundColor: "#050805",
    padding: 15,
    borderLeftWidth: 2,
    borderLeftColor: "#00ff8827",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
    paddingTop: 5,
  },

  menuText: {
    color: "#fff",
    fontSize: 14,
  },

  profileSection: {
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#00ff8827",
  },

  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },

  profileName: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },

  profileEmail: {
    color: "#aaa",
    fontSize: 12,
  },
});
