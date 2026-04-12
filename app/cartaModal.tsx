import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { publicarCarta } from "@/src/service/cartas";
import { Props } from "@/src/types/props";

export default function CartaModal({
  visible,
  carta,
  onClose,
  onEliminar,
  onPublicar,
  onAgregar,
  onQuitar,
  modo = "inventario",
  cantidad = 0,
}: Props) {
  const [precioModal, setPrecioModal] = useState(false);
  const [precio, setPrecio] = useState("");

  if (!carta) return null;

  const id = "id_carta" in carta ? carta.id_carta : carta.id;

  const abrirPublicar = () => {
    setPrecio("");
    setPrecioModal(true);
  };

  const confirmarPublicacion = async () => {
    try {
      const valor = Number(precio);

      if (isNaN(valor) || valor <= 0) {
        Alert.alert("Error", "Ingresa un precio válido");
        return;
      }

      if (onPublicar) {
        await onPublicar(id);
      } else {
        await publicarCarta(id, { precio: valor });
      }

      Alert.alert("Éxito", "Carta publicada con éxito");

      setPrecioModal(false);
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo publicar la carta");
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={{ uri: carta.imagen_url }}
              style={styles.modalImage}
            />

            <Text style={styles.modalTitle}>{carta.nombre}</Text>

            {modo === "publicado" && (
              <>
                {/* USUARIO (bloque separado a la derecha) */}
                {"usuario" in carta && carta.usuario && (
                  <View style={styles.userBlockRight}>
                    <Image
                      source={{ uri: carta.usuario.foto_perfil }}
                      style={styles.avatarBig}
                    />

                    <View style={styles.userTextBox}>
                      <Text style={styles.usernameBig}>
                        {carta.usuario.nombre_usuario}
                      </Text>

                      <Text style={styles.reputacion}>
                        ⭐ {carta.usuario.reputacion}
                      </Text>
                    </View>
                  </View>
                )}

                {"precio" in carta && (
                  <Text style={styles.precio}>${carta.precio ?? 0}</Text>
                )}
              </>
            )}

            <View style={styles.infoBox}>
              {/* INFO CARTA (IZQUIERDA) */}
              {"juego" in carta && carta.juego && (
                <Text style={styles.modalText}>Juego: {carta.juego}</Text>
              )}

              {"edicion" in carta && carta.edicion && (
                <Text style={styles.modalText}>Edición: {carta.edicion}</Text>
              )}

              {"numero" in carta && carta.numero && (
                <Text style={styles.modalText}>Número: {carta.numero}</Text>
              )}

              {carta.rareza && (
                <Text style={styles.modalText}>Rareza: {carta.rareza}</Text>
              )}
            </View>

            {carta.descripcion && (
              <Text style={styles.modalText}>
                Descripción: {carta.descripcion}
              </Text>
            )}

            {carta.tipo && carta.tipo.length > 0 && (
              <View style={styles.tipoContainer}>
                {carta.tipo.map((t, index) => (
                  <View key={index} style={styles.tipoBadge}>
                    <Text style={styles.tipoText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ================= BOTONES ================= */}
            <View style={styles.modalButtons}>
              {/* PUBLICAR */}
              {modo === "inventario" && (
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={abrirPublicar}
                >
                  <Text style={styles.editText}>Publicar</Text>
                </TouchableOpacity>
              )}

              {/* ELIMINAR */}
              {onEliminar && modo === "inventario" && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onEliminar(id)}
                >
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              )}

              {/* MARKETPLACE */}
              {modo === "publicado" && (
                <View style={styles.marketButtons}>
                  <TouchableOpacity style={styles.buyBtn}>
                    <Text style={styles.buyText}>Comprar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.offerBtn}>
                    <Text style={styles.offerText}>Ofertar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* BUSQUEDA */}
              {modo === "busqueda" && (
                <View style={styles.counterBox}>
                  <TouchableOpacity onPress={() => onQuitar?.(id)}>
                    <Text style={styles.counterBtn}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.counterText}>{cantidad}</Text>

                  <TouchableOpacity onPress={() => onAgregar?.(id)}>
                    <Text style={styles.counterBtn}>+</Text>
                  </TouchableOpacity>
                </View>
              )}

              {modo === "lote" && onEliminar && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onEliminar(id)}
                >
                  <Text style={styles.deleteText}>Eliminar del lote</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* CERRAR */}
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <Text style={styles.closeX}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL PRECIO ================= */}
      <Modal visible={precioModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.priceModal}>
            <Text style={styles.modalTitle}>Establecer precio</Text>

            <TextInput
              placeholder="Precio de la carta"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={precio}
              onChangeText={setPrecio}
              style={styles.inputPrecio}
            />

            <View style={styles.priceButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPrecioModal(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={confirmarPublicacion}
              >
                <Text style={styles.confirmText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    width: "50%",
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
    alignItems: "center",
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

  counterBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  counterBtn: {
    color: "#00ff88",
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 8,
  },

  counterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
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

  priceModal: {
    width: "85%",
    backgroundColor: "#0d140f",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00ff8850",
  },

  inputPrecio: {
    width: "100%",
    backgroundColor: "#0f2a1d",
    borderWidth: 1,
    borderColor: "#00ff8850",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  priceButtons: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#0f2a1d",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00ff8850",
  },

  confirmBtn: {
    flex: 1,
    backgroundColor: "#00ff88",
    padding: 12,
    borderRadius: 10,
  },

  cancelText: {
    color: "#00ff88",
    textAlign: "center",
    fontWeight: "bold",
  },

  confirmText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
  },
  userPublicador: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },

  avatarBig: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  usernameBig: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },

  reputacion: {
    color: "#00ff88",
    fontSize: 12,
  },

  precio: {
    color: "#ffffff",
    fontSize: 27,
    marginVertical: 1,
    alignSelf: "flex-start",
    fontWeight: "bold",
  },

  marketButtons: {
    flexDirection: "row",
    gap: 10,
  },

  buyBtn: {
    flex: 1,
    backgroundColor: "#00ff88",
    padding: 12,
    borderRadius: 10,
  },

  offerBtn: {
    flex: 1,
    backgroundColor: "#0f2a1d",
    borderWidth: 1,
    borderColor: "#00ff88",
    padding: 12,
    borderRadius: 10,
  },

  buyText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },

  offerText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#00ff88",
  },
  tipoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    justifyContent: "center",
  },
  tipoBadge: {
    backgroundColor: "#0f2a1d",
    borderWidth: 1,
    borderColor: "#00ff8850",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tipoText: {
    color: "#00ff88",
    fontSize: 12,
    fontWeight: "600",
  },
  userBlockRight: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: "auto",
    gap: 10,
    backgroundColor: "#0a1d14",
    borderWidth: 1,
    borderColor: "#00ff8828",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,

    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  userTextBox: {
    alignItems: "flex-start",
  },

  infoBox: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: 10,
  },
});
