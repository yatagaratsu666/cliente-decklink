import { eliminarCarta, getCartas } from "@/src/service/cartas";
import { Carta } from "@/src/types/carta";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CartaModal from "./cartaModal";

export default function Home() {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCarta, setSelectedCarta] = useState<Carta | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();

  useEffect(() => {
    cargarCartas();
  }, []);

  const cargarCartas = async () => {
    try {
      const data = await getCartas();
      setCartas(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = (id: string | number) => {
    Alert.alert("Eliminar carta", "¿Estás seguro de eliminar esta carta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        onPress: async () => {
          try {
            await eliminarCarta(Number(id));

            setCartas((prev) =>
              prev.filter((c) => String(c.id_carta) !== String(id)),
            );

            setModalVisible(false);
            setSelectedCarta(null);
          } catch {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.title}>Mi inventario</Text>

        <TouchableOpacity
          style={styles.lotesBtn}
          onPress={() => router.push("/lotes" as any)}
        >
          <Ionicons name="layers-outline" size={20} color="#000" />
          <Text style={styles.lotesText}>Lotes</Text>
        </TouchableOpacity>
      </View>

      {cartas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No tienes cartas en tu inventario
          </Text>

          <Text style={styles.emptySubText}>
            ¡Crea tu primera carta y empieza tu colección! :3
          </Text>
        </View>
      ) : (
        <FlatList
          data={cartas}
          keyExtractor={(item) => String(item.id_carta)}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                setSelectedCarta(item);
                setModalVisible(true);
              }}
            >
              <Image
                source={{ uri: item.imagen_url || "" }}
                style={styles.image}
              />

              <View style={styles.info}>
                <Text style={styles.name}>{item.nombre}</Text>
                <Text style={styles.category}>{item.juego}</Text>
                <Text style={styles.rareza}>{item.rareza}</Text>
                <Text style={styles.tipo}>
                  {item.tipo?.join(", ") || "Sin tipo"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/crear-carta")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <CartaModal
        visible={modalVisible}
        carta={selectedCarta}
        onClose={() => {
          setModalVisible(false);
          setSelectedCarta(null);
        }}
        onEliminar={handleEliminar}
        modo="inventario"
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050805",
  },

  card: {
    backgroundColor: "#0d140f",
    width: "48%",
    borderRadius: 14,
    marginBottom: 15,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#00ff8830",

    shadowColor: "#00ff88",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  image: {
    margin: 10,
    width: "100%",
    height: 200,
    borderRadius: 10,
    aspectRatio: 0.7,
    resizeMode: "cover",
  },

  info: {
    paddingBottom: 8,
    paddingLeft: 11,
  },

  name: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  category: {
    color: "#00ff88",
    fontSize: 12,
    marginTop: 2,
  },

  rareza: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 2,
  },

  fab: {
    position: "absolute",
    bottom: 55,
    left: 20,

    width: 60,
    height: 60,
    borderRadius: 50,

    backgroundColor: "#00ff88",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#00ff88",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

  fabText: {
    color: "#000",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: -2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "90%",
    backgroundColor: "#0d140f",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
  },

  modalImage: {
    width: "100%",
    margin: 35,
    aspectRatio: 0.7,
    borderRadius: 10,
    marginBottom: 10,
  },

  modalTitle: {
    color: "#00ff88",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },

  modalText: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 3,
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
  },

  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },

  closeX: {
    color: "#00ff88",
    fontSize: 28,
    fontWeight: "bold",
  },

  editBtn: {
    flex: 1,
    backgroundColor: "#00ff88",
    padding: 12,
    borderRadius: 10,
    marginRight: 5,

    shadowColor: "#00ff88",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  editText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
  },

  deleteBtn: {
    flex: 1,
    backgroundColor: "#0f2a1d",
    padding: 12,
    borderRadius: 10,
    marginLeft: 5,

    borderWidth: 1,
    borderColor: "#00ff8850",
  },

  deleteText: {
    color: "#00ff88",
    textAlign: "center",
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyText: {
    color: "#00ff88",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  emptySubText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
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
  tipo: {
    color: "#888",
    fontSize: 10,
    marginTop: 2,
  },
});
