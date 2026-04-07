import { getCartas } from "@/src/service/cartas";
import {
  agregarCartaLote,
  getCartasLote,
  quitarCartaLote,
} from "@/src/service/lote";
import { Carta } from "@/src/types/carta";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CartaModal from "./cartaModal";

export default function LoteDetalle() {
  const { id } = useLocalSearchParams();
  const loteId = Number(id);
  const router = useRouter();

  const [cartas, setCartas] = useState<Carta[]>([]);
  const [inventario, setInventario] = useState<Carta[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedCarta, setSelectedCarta] = useState<Carta | null>(null);

  useEffect(() => {
    cargarCartas();
  }, []);

  const cargarCartas = async () => {
    const data = await getCartasLote(loteId);
    setCartas(data);
  };

  const abrirModal = async () => {
    const data = await getCartas();
    setInventario(data);
    setModalVisible(true);
  };

  const toggleSeleccion = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const agregarSeleccionadas = async () => {
    for (const id_carta of selected) {
      await agregarCartaLote(loteId, id_carta);
    }

    setModalVisible(false);
    setSelected([]);
    cargarCartas();
  };

  const quitarDelLote = async (idCarta: number) => {
    try {
      await quitarCartaLote(loteId, idCarta);

      setCartas((prev) => prev.filter((c) => c.id_carta !== idCarta));

      setSelectedCarta(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.title}>Cartas del lote</Text>

        <TouchableOpacity style={styles.lotesBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#000" />
          <Text style={styles.lotesText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {cartas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Este lote está vacío</Text>
          <Text style={styles.emptySubText}>
            Agrega cartas usando el botón +
          </Text>
        </View>
      ) : (
        <FlatList
          data={cartas}
          keyExtractor={(item) => item.id_carta.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedCarta(item)}
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

      <TouchableOpacity style={styles.fab} onPress={abrirModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <CartaModal
        visible={!!selectedCarta}
        carta={selectedCarta}
        onClose={() => setSelectedCarta(null)}
        onEliminar={quitarDelLote}
        modo="lote"
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.modalTitleSelect}>Seleccionar cartas</Text>

          <FlatList
            contentContainerStyle={{ paddingBottom: 100, marginTop: 10 }}
            data={inventario}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            keyExtractor={(item) => item.id_carta.toString()}
            renderItem={({ item }) => {
              const isSelected = selected.includes(item.id_carta);

              return (
                <TouchableOpacity
                  style={[
                    styles.card,
                    isSelected && { borderColor: "#00ff88" },
                  ]}
                  onPress={() => toggleSeleccion(item.id_carta)}
                >
                  <Image source={{ uri: item.imagen }} style={styles.image} />

                  <View style={styles.info}>
                    <Text style={styles.name}>{item.nombre}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.addButtonInline}
              onPress={agregarSeleccionadas}
            >
              <Text style={styles.addButtonText}>
                Agregar ({selected.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButtonInline}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
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

  modalTitleSelect: {
    color: "#00ff88",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  actionsContainer: {
    position: "absolute",
    bottom: 20,
    width: "106%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 10,
  },

  addButtonInline: {
    flex: 1,
    backgroundColor: "#00ff88",
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",

    shadowColor: "#00ff88",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  cancelButtonInline: {
    flex: 1,
    backgroundColor: "#0f2a1d",
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",

    borderWidth: 2,
    borderColor: "#00ff8850",
  },

  addButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },

  cancelButtonText: {
    color: "#00ff88",
    fontWeight: "bold",
    fontSize: 15,
  },
});
