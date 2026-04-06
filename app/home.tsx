import { AuthContext } from "@/src/service/auth";
import { eliminarCarta, getCartas } from "@/src/service/cartas";
import { Carta } from "@/src/types/carta";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function Home() {
  const { logout } = useContext(AuthContext);

  const [cartas, setCartas] = useState<Carta[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCarta, setSelectedCarta] = useState<Carta | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    cargarCartas();
  }, []);

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        onPress: () => {
          logout();
          router.replace("/");
        },
      },
    ]);
  };

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    );
  }

  const router = useRouter();

  const handleEliminar = (id: number) => {
    Alert.alert("Eliminar carta", "¿Estás seguro de eliminar esta carta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        onPress: async () => {
          try {
            await eliminarCarta(id);

            setCartas((prev) => prev.filter((c) => c.id_carta !== id));

            setModalVisible(false);
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={25} color="#00ff88" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/decklink-logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logo}>DECKLINK</Text>
        </View>

        <View style={styles.headerRight}>
          <Ionicons name="search" size={25} color="#00ff88" />
        </View>
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
          keyExtractor={(item) => item.id_carta.toString()}
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
              <Image source={{ uri: item.imagen }} style={styles.image} />

              <View style={styles.info}>
                <Text style={styles.name}>{item.nombre}</Text>
                <Text style={styles.category}>{item.categoria}</Text>
                <Text style={styles.rareza}>{item.rareza}</Text>
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
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCarta && (
              <>
                <Image
                  source={{ uri: selectedCarta.imagen }}
                  style={styles.modalImage}
                />

                <Text style={styles.modalTitle}>{selectedCarta.nombre}</Text>

                <Text style={styles.modalText}>
                  Categoría: {selectedCarta.categoria}
                </Text>

                <Text style={styles.modalText}>
                  Rareza: {selectedCarta.rareza}
                </Text>

                <Text style={styles.modalText}>
                  Estado: {selectedCarta.estado}
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.editBtn}>
                    <Text
                      style={styles.editText}
                      onPress={() => {
                        setModalVisible(false);

                        router.push({
                          pathname: "/crear-carta",
                          params: { carta: JSON.stringify(selectedCarta) },
                        });
                      }}
                    >
                      Modificar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleEliminar(selectedCarta!.id_carta)}
                  >
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeX}>×</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050805",
    paddingHorizontal: 10,
    paddingTop: 35,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050805",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#00ff8830",
    paddingBottom: 15,
    paddingTop: 15,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
});
