import {
  getLotePublicadoDetalle,
  getLotesPublicados,
} from "@/src/service/lote";
import {
  buscarCartas,
  buscarLotes,
  getPublicaciones,
} from "@/src/service/publicacion";
import { getProfile } from "@/src/service/usuario";
import { Publicacion } from "@/src/types/publicacion";
import { User } from "@/src/types/usuario";
import { Ionicons } from "@expo/vector-icons";
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
import LoteModal from "./lote-modal";

export default function Publicados() {
  const [cartas, setCartas] = useState<Publicacion[]>([]);
  const [lotes, setLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const eliminarPublicacionLocal = (id: number) => {
    setCartas((prev) => prev.filter((c) => c.id_publicacion !== id));
    setLotes((prev) => prev.filter((l) => l.id_publicacion !== id));
  };

  const [tipoVista, setTipoVista] = useState<"cartas" | "lotes">("cartas");

  const [selectedCarta, setSelectedCarta] = useState<Publicacion | null>(null);
  const [modalCartaVisible, setModalCartaVisible] = useState(false);

  const [loteDetalle, setLoteDetalle] = useState<any>(null);
  const [modalLoteVisible, setModalLoteVisible] = useState(false);

  const [usuarioLogeado, setUsuarioLogeado] = useState<User | null>(null);

  useEffect(() => {
    cargar();
    cargarUsuario();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!search.trim()) return;

      try {
        if (tipoVista === "cartas") {
          const res = await buscarCartas(search);
          setCartas(res || []);
        } else {
          const res = await buscarLotes(search);
          setLotes(res || []);
        }
      } catch (error) {
        console.log("Error búsqueda:", error);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, tipoVista]);

  const cargarUsuario = async () => {
    const user = await getProfile();
    setUsuarioLogeado(user);
  };

  const cargar = async () => {
    try {
      setLoading(true);
      const publicaciones = await getPublicaciones();
      const lotesData = await getLotesPublicados();

      setCartas(publicaciones || []);
      setLotes(lotesData);
    } finally {
      setLoading(false);
    }
  };

  const abrirLote = async (item: any) => {
    try {
      const data = await getLotePublicadoDetalle(item.id_publicacion);
      setLoteDetalle(data);
      setModalLoteVisible(true);
    } catch (error) {
      console.log(error);
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
        data={(tipoVista === "cartas" ? cartas : lotes).filter(
          (item) => item.estado === "activa",
        )}
        keyExtractor={(item) => String(item.id_publicacion)}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Publicados</Text>

            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#00ff88" />
                <TextInput
                  placeholder={
                    tipoVista === "cartas"
                      ? "Buscar cartas..."
                      : "Buscar lotes..."
                  }
                  placeholderTextColor="#666"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              <TouchableOpacity
                style={styles.filterBtn}
                onPress={() =>
                  setTipoVista((prev) =>
                    prev === "cartas" ? "lotes" : "cartas",
                  )
                }
              >
                <Ionicons
                  name={tipoVista === "cartas" ? "albums" : "image"}
                  size={16}
                  color="#000"
                />
                <Text style={styles.filterText}>
                  {tipoVista === "cartas" ? "Lotes" : "Cartas"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#00ff88" />

            <Text style={styles.emptyTitle}>
              No hay publicaciones disponibles
            </Text>

            <Text style={styles.emptySubtitle}>
              Aún no existen cartas o lotes publicados{"\n"}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          if (tipoVista === "cartas") {
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  setSelectedCarta(item);
                  setModalCartaVisible(true);
                }}
              >
                <View style={styles.userRow}>
                  <Image
                    source={{
                      uri:
                        item.usuario?.foto_perfil ||
                        "https://i.pravatar.cc/100",
                    }}
                    style={styles.avatar}
                  />

                  <View>
                    <Text style={styles.username}>
                      {item.usuario?.nombre_usuario || "Usuario"}
                    </Text>

                    <Text style={styles.rating}>
                      ⭐ {item.usuario?.reputacion || "1.0"}
                    </Text>
                  </View>
                </View>

                <Image source={{ uri: item.imagen_url }} style={styles.image} />

                <Text style={styles.name}>{item.nombre}</Text>

                <Text style={styles.meta}>
                  {item.juego} • {item.edicion}
                </Text>

                <Text style={styles.rareza}>
                  {item.rareza} • Nº {item.numero}
                </Text>

                <Text style={styles.precio}>${item.precio}</Text>

                <Text style={styles.fecha}>
                  {new Date(item.fecha_creacion).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => abrirLote(item)}
            >
              <View style={styles.loteIcon}>
                <Ionicons name="albums" size={18} color="#00ff88" />
              </View>

              <View style={styles.userRow}>
                <Image
                  source={{
                    uri:
                      item.usuario?.foto_perfil || "https://i.pravatar.cc/100",
                  }}
                  style={styles.avatar}
                />

                <View>
                  <Text style={styles.username}>
                    {item.usuario?.nombre_usuario || "Usuario"}
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

              <View style={styles.loteIcon}>
                <Ionicons name="albums" size={18} color="#00ff88" />
              </View>

              <Text style={styles.name}>Contenido</Text>

              <Text style={styles.meta}>
                {item.cartas
                  ?.slice(0, 3)
                  .map((c: any) => c.nombre)
                  .join(", ") + (item.cartas?.length > 3 ? "..." : "")}
              </Text>

              <Text style={styles.precio}>${item.precio}</Text>

              <Text style={styles.fecha}>
                {new Date(item.fecha_creacion).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {selectedCarta && (
        <CartaModal
          visible={modalCartaVisible}
          carta={selectedCarta}
          modo="publicado"
          esPropia={
            !!usuarioLogeado &&
            selectedCarta?.usuario?.id_usuario === usuarioLogeado?.id_usuario
          }
          onEliminar={(id) => {
            setCartas((prev) =>
              prev.filter((item) => item.id_publicacion !== id),
            );
          }}
          onClose={() => {
            setModalCartaVisible(false);
            setSelectedCarta(null);
          }}
        />
      )}

      {loteDetalle && (
        <LoteModal
          visible={modalLoteVisible}
          lote={loteDetalle}
          onEliminar={(id: number) => {
            eliminarPublicacionLocal(id);
            cargar();
          }}
          onClose={() => {
            setModalLoteVisible(false);
            setLoteDetalle(null);
          }}
        />
      )}
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
    justifyContent: "center",
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
    paddingBottom: 20,
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

  rareza: {
    color: "#aaa",
    fontSize: 11,
    paddingHorizontal: 8,
  },

  precio: {
    color: "#00ff88",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingTop: 4,
    marginBottom: 5,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00ff88",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
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
  },
  emptyContainer: {
    marginTop: 80,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: "#00ff88",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },

  emptySubtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  filterText: {
    color: "#000",
    fontWeight: "bold",
  },
  rating: {
    color: "#00ff88",
    fontSize: 11,
  },

  fecha: {
    color: "#ffffff70",
    fontSize: 11,
    paddingHorizontal: 8,
    marginBottom: 8,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingTop: 8,
  },

  avatar: {
    width: 26,
    height: 26,
    borderRadius: 50,
  },

  username: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
