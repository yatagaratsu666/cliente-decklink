import { getPublicaciones } from "@/src/service/publicacion";
import { Publicacion } from "@/src/types/publicacion";
import { User } from "@/src/types/usuario";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import CartaModal from "./cartaModal";

export default function Publicados() {
  const router = useRouter();

  const [data, setData] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Record<number, User>>({});

  const [selected, setSelected] = useState<Publicacion | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);

      const publicaciones = await getPublicaciones();
      setData(publicaciones);

      const map: Record<number, User> = {};

      setUsuarios(map);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#00ff88" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <View style={styles.topSection}>
              <Text style={styles.title}>Publicados</Text>
            </View>

            {/* SEARCH + FILTER BAR */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#00ff88" />

                <TextInput
                  placeholder="Buscar cartas..."
                  placeholderTextColor="#666"
                  style={styles.searchInput}
                />
              </View>

              <TouchableOpacity style={styles.filterBtn}>
                <Ionicons name="options-outline" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const user = item.usuario;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                setSelected(item);
                setModalVisible(true);
              }}
            >
              <Image source={{ uri: item.imagen_url }} style={styles.image} />

              <View style={styles.userRow}>
                <Image
                  source={{
                    uri:
                      user?.foto_perfil ||
                      "https://i.imgur.com/placeholder.png",
                  }}
                  style={styles.avatar}
                />

                <Text style={styles.username}>
                  {user?.nombre_usuario || "Usuario"}
                </Text>
              </View>

              <Text style={styles.name}>{item.nombre}</Text>

              <Text style={styles.meta}>{item.juego}</Text>

              {item.rareza && <Text style={styles.rareza}>{item.rareza}</Text>}

              <Text style={styles.precio}>${item.precio ?? 0}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <CartaModal
        visible={modalVisible}
        carta={selected}
        modo="publicado"
        onClose={() => {
          setModalVisible(false);
          setSelected(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050805",
    paddingHorizontal: 10,
    paddingTop: 15,
  },

  center: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#050805",
  },

  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    color: "#00ff88",
    fontSize: 22,
    fontWeight: "bold",
  },

  lotesBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00ff88",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },

  lotesText: {
    color: "#000",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#0d140f",
    width: "48%",
    borderRadius: 14,
    marginBottom: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#00ff8830",
  },

  image: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
    backgroundColor: "#0a0f0b",
    marginTop: 10,
  },

  name: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
    paddingHorizontal: 8,
  },

  meta: {
    color: "#00ff88",
    fontSize: 11,
    paddingHorizontal: 8,
    marginTop: 2,
  },

  rareza: {
    color: "#aaa",
    fontSize: 11,
    paddingHorizontal: 8,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingLeft: 9,
    paddingTop: 8,
  },

  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },

  username: {
    color: "#ffffff8b",
    fontSize: 12,
  },

  precio: {
    color: "#00ff88",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,

    backgroundColor: "#0d140f",
    borderWidth: 1,
    borderColor: "#00ff8850",

    paddingHorizontal: 12,
    borderRadius: 12,
    height: 42,
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },

  filterBtn: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#00ff88",
    borderRadius: 12,
  },
});
