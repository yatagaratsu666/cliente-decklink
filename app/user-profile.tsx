import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getPublicacionesUsuario } from "@/src/service/publicacion";
import {
  getProfile,
  getResenasUsuario,
  getUserById,
} from "@/src/service/usuario";

import CartaCard from "./carta-card";
import CartaModal from "./cartaModal";

import {
  getLotePublicadoDetalle,
  getLotesPublicados,
} from "@/src/service/lote";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import LoteModal from "./lote-modal";

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);

  const [usuarioLogeado, setUsuarioLogeado] = useState<any>(null);

  const [resenas, setResenas] = useState<any[]>([]);

  const [selectedCarta, setSelectedCarta] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [lotes, setLotes] = useState<any[]>([]);
  const [tipoVista, setTipoVista] = useState<"cartas" | "lotes">("cartas");

  const [loteDetalle, setLoteDetalle] = useState<any>(null);
  const [modalLoteVisible, setModalLoteVisible] = useState(false);

  const ownerId =
    selectedCarta?.usuario?.id_usuario ?? selectedCarta?.id_usuario;

  const { id } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    loadData();
    loadUsuarioLogeado();
  }, [id]);

  const loadUsuarioLogeado = async () => {
    const u = await getProfile();
    setUsuarioLogeado(u);
  };

  const loadData = async () => {
    try {
      const userId = id ? Number(id) : null;

      let userData;

      if (userId) {
        userData = await getUserById(userId);
      } else {
        userData = await getProfile();
      }

      setUser(userData);

      const finalUserId = userId || userData!.id_usuario;

      const pubs = await getPublicacionesUsuario(finalUserId);
      setPublicaciones(pubs || []);

      const res = await getResenasUsuario(finalUserId);
      setResenas(res || []);

      const lotesData = await getLotesPublicados();

      const lotesUsuario = (lotesData || []).filter(
        (l: any) => l.usuario?.id_usuario === finalUserId,
      );

      setLotes(lotesUsuario);
    } catch (error) {
      console.log("Error cargando perfil:", error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white", textAlign: "center", marginTop: 50 }}>
          Cargando...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Image
              source={{
                uri:
                  user.foto_perfil ||
                  "https://i.pinimg.com/736x/d3/22/48/d322487946b0c6c2deb0fcf38b77e963.jpg",
              }}
              style={styles.avatar}
            />

            <View style={styles.userInfo}>
              <Text style={styles.username}>{user.nombre_usuario}</Text>

              <View style={styles.verified}>
                <Text style={styles.verifiedText}>Reference Master</Text>
              </View>

              <View style={styles.stats}>
                <Text style={styles.rating}>
                  ⭐ {Number(user.reputacion || 0).toFixed(1)} ({resenas.length}{" "}
                  reseñas)
                </Text>
              </View>

              <Text style={styles.publicaciones}>
                {publicaciones.length} publicaciones
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTipoVista("cartas")}>
            <Text
              style={tipoVista === "cartas" ? styles.activeTab : styles.tab}
            >
              Cartas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTipoVista("lotes")}>
            <Text style={tipoVista === "lotes" ? styles.activeTab : styles.tab}>
              Lotes
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tipoVista === "cartas" ? publicaciones : lotes}
          keyExtractor={(item) => item.id_publicacion.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (tipoVista === "cartas") {
              return (
                <CartaCard
                  carta={item}
                  onPress={() => {
                    setSelectedCarta(item);
                    setModalVisible(true);
                  }}
                />
              );
            }

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={async () => {
                  const data = await getLotePublicadoDetalle(
                    item.id_publicacion,
                  );
                  setLoteDetalle(data);
                  setModalLoteVisible(true);
                }}
              >
                <View style={styles.loteIcon}>
                  <Ionicons name="albums" size={18} color="#00ff88" />
                </View>

                <View style={styles.userRow}>
                  <Image
                    source={{
                      uri:
                        item.usuario?.foto_perfil ||
                        "https://i.pinimg.com/736x/d3/22/48/d322487946b0c6c2deb0fcf38b77e963.jpg",
                    }}
                    style={styles.avatarSmall}
                  />

                  <View>
                    <Text style={styles.usernameSmall}>
                      {item.usuario?.nombre_usuario}
                    </Text>

                    <Text style={styles.rating}>
                      ⭐ {item.usuario?.reputacion || "1.0"}
                    </Text>
                  </View>
                </View>

                <Image
                  source={{ uri: item.imagen_preview }}
                  style={styles.image}
                />

                <Text style={styles.name}>Contenido</Text>

                <Text style={styles.meta}>
                  {item.cartas
                    ?.slice(0, 3)
                    .map((c: any) => c.nombre)
                    .join(", ") + (item.cartas?.length > 3 ? "..." : "")}
                </Text>

                <Text style={styles.precio}>${item.precio}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {id && (
                <Ionicons
                  name="albums-outline"
                  size={70}
                  color="#00ff8850"
                  style={{ marginBottom: 10 }}
                />
              )}

              <Text style={styles.emptyText}>
                {id
                  ? "Este usuario no tiene publicaciones activas"
                  : "No tienes publicaciones, ve al inventario para crear más :3"}
              </Text>

              {usuarioLogeado &&
                user &&
                usuarioLogeado.id_usuario === user.id_usuario && (
                  <TouchableOpacity
                    style={styles.inventoryButton}
                    onPress={() => router.push("/home")}
                  >
                    <Text style={styles.inventoryButtonText}>
                      Ir a inventario
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          }
        />

        <CartaModal
          visible={modalVisible}
          carta={selectedCarta}
          modo="publicado"
          esPropia={!!usuarioLogeado && ownerId === usuarioLogeado?.id_usuario}
          onClose={() => {
            setModalVisible(false);
            setSelectedCarta(null);
          }}
        />
        <LoteModal
          visible={modalLoteVisible}
          lote={loteDetalle}
          onEliminar={() => loadData()}
          onClose={() => {
            setModalLoteVisible(false);
            setLoteDetalle(null);
          }}
        />
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050805",
  },

  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#021a10",
    borderBottomWidth: 1,
    borderBottomColor: "#00ff8830",
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#00ff88",
  },

  userInfo: {
    marginLeft: 15,
    flex: 1,
  },

  username: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  verified: {
    backgroundColor: "#00ff88",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 5,
  },

  verifiedText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },

  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },

  rating: {
    color: "#00ff88",
    fontWeight: "bold",
    fontSize: 11,
  },

  publicaciones: {
    color: "#aaa",
    marginTop: 6,
    fontSize: 13,
  },

  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#00ff8830",
  },

  activeTab: {
    color: "#00ff88",
    fontSize: 16,
    fontWeight: "bold",
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#00ff88",
    marginRight: 15,
  },

  tab: {
    color: "#aaa",
    fontSize: 16,
    marginRight: 15,
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
    color: "#aaa",
    fontSize: 11,
    paddingHorizontal: 8,
    marginTop: 2,
  },

  precio: {
    color: "#00ff88",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingTop: 4,
    marginBottom: 5,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingTop: 8,
  },

  avatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 50,
  },

  usernameSmall: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  loteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#0d140f",
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: "#00ff8850",
    zIndex: 10,
  },

  emptyContainer: {
    marginTop: 80,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },

  inventoryButton: {
    backgroundColor: "#00ff88",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },

  inventoryButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
});
