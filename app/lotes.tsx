import {
    actualizarLote,
    crearLote,
    eliminarLote,
    getLotes,
} from "@/src/service/lote";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Lotes() {
  const [lotes, setLotes] = useState<any[]>([]);
  const router = useRouter();

  const [modalEditar, setModalEditar] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState<any>(null);

  const [modo, setModo] = useState<"crear" | "editar">("crear");

  useEffect(() => {
    cargarLotes();
  }, []);

  const cargarLotes = async () => {
    const data = await getLotes();
    setLotes(data);
  };

  const guardarNombre = async () => {
    try {
      if (!nuevoNombre.trim()) return;

      if (modo === "crear") {
        await crearLote(nuevoNombre);
      } else {
        await actualizarLote(loteSeleccionado.id_lote, nuevoNombre);
      }

      setModalEditar(false);
      setNuevoNombre("");
      setLoteSeleccionado(null);

      cargarLotes();
    } catch (error) {
      console.log(error);
    }
  };

  const eliminar = async () => {
    try {
      await eliminarLote(loteSeleccionado.id_lote);

      setModalEditar(false);
      setLoteSeleccionado(null);

      cargarLotes();
    } catch (error) {
      console.log(error);
    }
  };

  const abrirEditar = (lote: any) => {
    setModo("editar");
    setLoteSeleccionado(lote);
    setNuevoNombre(lote.nombre);
    setModalEditar(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.title}>Mis Lotes</Text>

        <TouchableOpacity style={styles.lotesBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#000" />
          <Text style={styles.lotesText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {lotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="layers-outline" size={60} color="#00ff88" />

          <Text style={styles.emptyText}>No tienes lotes</Text>

          <Text style={styles.emptySubText}>
            Crea tu primer lote para organizar tus cartas :3
          </Text>
        </View>
      ) : (
        <FlatList
          data={lotes}
          keyExtractor={(item) => item.id_lote.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.loteCard}
              onPress={() =>
                router.push({
                  pathname: "/lote-detalle",
                  params: {
                    id: item.id_lote,
                    nombre: item.nombre,
                  },
                } as any)
              }
              onLongPress={() => abrirEditar(item)}
            >
              <Text style={styles.loteName}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setModo("crear");
          setNuevoNombre("");
          setModalEditar(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <Modal visible={modalEditar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {modo === "crear" ? "Crear lote" : "Editar lote"}
            </Text>

            <TextInput
              style={styles.input}
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              placeholder="Nuevo nombre"
              placeholderTextColor="#777"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={guardarNombre}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
            {modo === "editar" && (
              <TouchableOpacity style={styles.deleteBtn} onPress={eliminar}>
                <Text style={styles.deleteText}>Eliminar lote</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setModalEditar(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
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
    padding: 15,
  },

  title: {
    color: "#00ff88",
    fontSize: 22,
    fontWeight: "bold",
  },

  loteCard: {
    backgroundColor: "#0d140f",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,

    borderWidth: 1,
    borderColor: "#00ff8830",
  },

  loteName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyText: {
    color: "#00ff88",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },

  emptySubText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#0d140f",
    borderRadius: 15,
    padding: 20,
  },

  modalTitle: {
    color: "#00ff88",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#050805",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#00ff8830",
  },

  saveBtn: {
    backgroundColor: "#00ff88",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  saveText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
  },

  cancelText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 10,
  },

  deleteBtn: {
    backgroundColor: "#0f2a1d",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#00ff8850",
  },

  deleteText: {
    color: "#00ff88",
    textAlign: "center",
  },
});
