import { Props } from "@/src/types/props";
import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CartaModal({
  visible,
  carta,
  onClose,
  onEliminar,
  modo = "inventario",
}: Props) {
  const router = useRouter();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {carta && (
            <>
              <Image source={{ uri: carta.imagen }} style={styles.modalImage} />

              <Text style={styles.modalTitle}>{carta.nombre}</Text>

              <Text style={styles.modalText}>Categoría: {carta.categoria}</Text>

              <Text style={styles.modalText}>Rareza: {carta.rareza}</Text>

              <Text style={styles.modalText}>Estado: {carta.estado}</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.editBtn}>
                  <Text
                    style={styles.editText}
                    onPress={() => {
                      onClose();
                      router.push({
                        pathname: "/crear-carta",
                        params: { carta: JSON.stringify(carta) },
                      });
                    }}
                  >
                    Modificar
                  </Text>
                </TouchableOpacity>

                {onEliminar && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onEliminar(carta.id_carta)}
                  >
                    <Text style={styles.deleteText}>
                      {modo === "lote" ? "Quitar del lote" : "Eliminar"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                <Text style={styles.closeX}>×</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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

  editBtn: {
    flex: 1,
    backgroundColor: "#00ff88",
    padding: 12,
    borderRadius: 10,
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
    borderWidth: 1,
    borderColor: "#00ff8850",
  },

  deleteText: {
    color: "#00ff88",
    textAlign: "center",
    fontWeight: "bold",
  },

  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  closeX: {
    color: "#00ff88",
    fontSize: 28,
    fontWeight: "bold",
  },
});
