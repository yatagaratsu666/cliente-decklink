import {
  actualizarLote,
  crearLote,
  eliminarLote,
  getLotes,
  publicarLote,
} from "@/src/service/lote";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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

  const [modalPublicar, setModalPublicar] = useState(false);
  const [precio, setPrecio] = useState("");

  const [modo, setModo] = useState<"crear" | "editar">("crear");

  useEffect(() => {
    cargarLotes();
  }, []);

  const abrirPublicar = (lote: any) => {
    setLoteSeleccionado(lote);
    setPrecio("");
    setModalPublicar(true);
  };

  const confirmarPublicacion = async () => {
    try {
      if (!precio || isNaN(Number(precio))) {
        alert("Ingresa un precio válido");
        return;
      }

      await publicarLote(loteSeleccionado.id_lote, Number(precio));

      setModalPublicar(false);
      setLoteSeleccionado(null);

      alert("Lote publicado :3");
    } catch (error: any) {
      if (error.response?.data?.error === "conflicto_publicacion") {
        Alert.alert(
          "No permitido",
          "Alguna carta del lote ya está publicada individualmente",
        );
      } else {
        console.log(error);
        Alert.alert("Error", "No se pudo publicar el lote");
      }
    }
  };

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
            <View style={styles.loteCard}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/lote-detalle",
                    params: {
                      id: item.id_lote,
                      nombre: item.nombre,
                    },
                  } as any)
                }
              >
                <Text style={styles.loteName}>{item.nombre}</Text>

                <Text style={styles.loteCantidad}>
                  {item.total_cartas || 0} cartas
                </Text>
              </TouchableOpacity>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => abrirEditar(item)}
                >
                  <Ionicons name="create-outline" size={16} color="#00ff88" />
                  <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.publicarAction]}
                  onPress={() => abrirPublicar(item)}
                >
                  <Ionicons name="rocket-outline" size={16} color="#000" />
                  <Text style={styles.publicarActionText}>Publicar</Text>
                </TouchableOpacity>
              </View>
            </View>
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
      <Modal visible={modalPublicar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Publicar lote</Text>

            <TextInput
              style={styles.input}
              placeholder="Precio"
              placeholderTextColor="#777"
              keyboardType="numeric"
              value={precio}
              onChangeText={setPrecio}
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={confirmarPublicacion}
            >
              <Text style={styles.saveText}>Publicar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalPublicar(false)}>
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

  publicarBtn: {
    marginTop: 10,
    backgroundColor: "#0f2a1d",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00ff8850",
  },

  publicarText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 13,
  },
  loteCantidad: {
    color: "#888",
    fontSize: 13,
    marginTop: 3,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00ff8830",
    backgroundColor: "#0f2a1d",
  },

  actionText: {
    color: "#00ff88",
    fontSize: 12,
    fontWeight: "600",
  },

  publicarAction: {
    backgroundColor: "#00ff88",
    borderColor: "#00ff88",
  },

  publicarActionText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
});
