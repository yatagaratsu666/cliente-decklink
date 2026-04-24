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

import { getCartas, publicarCarta } from "@/src/service/cartas";
import { crearPropuesta } from "@/src/service/propuesta";
import { Props } from "@/src/types/props";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";

import { getLotes } from "@/src/service/lote";
import { despublicarCarta } from "@/src/service/publicacion";
import { getProfile } from "@/src/service/usuario";
import { useEffect } from "react";

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
  esPropia: esPropiaProp,
}: Props) {
  const [precioModal, setPrecioModal] = useState(false);
  const [precio, setPrecio] = useState("");
  const [ofertaModal, setOfertaModal] = useState(false);
  const [mensaje, setMensaje] = useState(
    "Hola, me interesaría cambiar esta carta",
  );
  const [cartaSeleccionada, setCartaSeleccionada] = useState<any>(null);
  const [misCartas, setMisCartas] = useState<any[]>([]);
  const router = useRouter();
  const [usuarioLogeado, setUsuarioLogeado] = useState<any>(null);

  const [tipoOferta, setTipoOferta] = useState<"carta" | "lote">("carta");
  const [misLotes, setMisLotes] = useState<any[]>([]);
  const [seleccionado, setSeleccionado] = useState<any>(null);

  useEffect(() => {
    const cargarUsuario = async () => {
      const user = await getProfile();
      setUsuarioLogeado(user);
    };

    cargarUsuario();
  }, []);

  const cargarDatos = async () => {
    const cartas = await getCartas();
    const lotes = await getLotes();

    setMisCartas(cartas || []);
    setMisLotes(lotes || []);
  };

  const eliminarPublicacionCarta = async () => {
    Alert.alert("Eliminar publicación", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            if (carta && "id_publicacion" in carta) {
              await despublicarCarta(carta.id_publicacion);
              onEliminar?.(carta.id_publicacion);
              setPrecioModal(false);
            }
            onClose();
          } catch (e) {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  const abrirOferta = async () => {
    await cargarDatos();
    setOfertaModal(true);
  };

  const enviarPropuesta = async () => {
    try {
      if (!seleccionado) {
        Alert.alert("Selecciona algo");
        return;
      }

      if (!usuarioLogeado) {
        Alert.alert("Error", "Usuario no cargado");
        return;
      }

      if (!carta || !("id_publicacion" in carta)) {
        Alert.alert("Error con la publicación");
        return;
      }

      const payload: any = {
        id_publicacion: carta.id_publicacion,
        id_usuario: usuarioLogeado.id_usuario,
        mensaje,
      };

      if (tipoOferta === "carta") {
        payload.id_carta_propone = seleccionado.id_carta;
      } else {
        payload.id_lote_propone = seleccionado.id_lote;
      }

      console.log("TIPO:", tipoOferta);
      console.log("SELECCIONADO:", seleccionado);
      console.log("ID LOTE:", seleccionado?.id_carta);

      const result = await crearPropuesta(payload);

      setOfertaModal(false);
      onClose();

      router.push({
        pathname: "/chat",
        params: {
          chatId: result.data.chatId,
        },
      });
    } catch (error: any) {
      console.log("ERROR COMPLETO:", error?.response?.data || error);
      Alert.alert("Error", JSON.stringify(error?.response?.data || error));
    }
  };

  if (!carta) return null;

  const esPropia =
    esPropiaProp ??
    (usuarioLogeado &&
      "id_usuario" in carta &&
      carta.id_usuario === usuarioLogeado.id_usuario);

  const id = "id_carta" in carta ? carta.id_carta : carta.id_publicacion;

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
    } catch (error: any) {
      if (error.response?.data?.error === "conflicto_publicacion") {
        Alert.alert("No permitido", "Esta carta ya está en un lote publicado");
      } else {
        Alert.alert("Error", "No se pudo publicar la carta");
      }
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);

    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
                {"usuario" in carta && carta.usuario && (
                  <TouchableOpacity
                    style={styles.userBlockRight}
                    onPress={() => {
                      if (carta.usuario?.id_usuario) {
                        router.push({
                          pathname: "/user-profile",
                          params: { id: carta.usuario.id_usuario },
                        });
                      } else {
                        router.push("/user-profile");
                      }
                    }}
                  >
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
                  </TouchableOpacity>
                )}

                {"precio" in carta && (
                  <Text style={styles.precio}>${carta.precio ?? 0}</Text>
                )}

                {"fecha_creacion" in carta && carta.fecha_creacion && (
                  <Text style={styles.fecha}>
                    Publicado el {formatearFecha(carta.fecha_creacion)}
                  </Text>
                )}
              </>
            )}

            <View style={styles.infoBox}>
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

            <View style={styles.modalButtons}>
              {modo === "inventario" && (
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={abrirPublicar}
                >
                  <Text style={styles.editText}>Publicar</Text>
                </TouchableOpacity>
              )}

              {onEliminar && modo === "inventario" && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onEliminar(id)}
                >
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              )}

              {modo === "publicado" && !esPropia && (
                <View style={styles.marketButtons}>
                  <TouchableOpacity style={styles.buyBtn}>
                    <Text style={styles.buyText}>Comprar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.offerBtn}
                    onPress={abrirOferta}
                  >
                    <Text style={styles.offerText}>Ofertar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {modo === "publicado" &&
                esPropia &&
                "id_publicacion" in carta && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => {
                      if (carta && "id_publicacion" in carta) {
                        eliminarPublicacionCarta();
                      }
                    }}
                  >
                    <Text style={styles.deleteText}>Eliminar publicación</Text>
                  </TouchableOpacity>
                )}

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

            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <Text style={styles.closeX}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
      <Modal visible={ofertaModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.offerModal}>
            <Text style={styles.modalTitle}>Crear Propuesta</Text>

            {/* SELECTOR */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              <TouchableOpacity
                style={[
                  styles.selectorBtn,
                  tipoOferta === "carta" && styles.selectorActive,
                ]}
                onPress={() => setTipoOferta("carta")}
              >
                <Text style={styles.selectorText}>Carta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.selectorBtn,
                  tipoOferta === "lote" && styles.selectorActive,
                ]}
                onPress={() => setTipoOferta("lote")}
              >
                <Text style={styles.selectorText}>Lote</Text>
              </TouchableOpacity>
            </View>

            {/* LISTA */}
            <ScrollView style={{ maxHeight: 200 }}>
              {(tipoOferta === "carta" ? misCartas : misLotes).map((item) => (
                <TouchableOpacity
                  key={tipoOferta === "carta" ? item.id_carta : item.id_lote}
                  style={[
                    styles.cartaItem,
                    seleccionado === item && styles.cartaSeleccionada,
                  ]}
                  onPress={() => setSeleccionado(item)}
                >
                  {tipoOferta === "carta" && (
                    <Image
                      source={{ uri: item.imagen_url }}
                      style={styles.cartaMini}
                    />
                  )}

                  <Text style={styles.modalText}>
                    {tipoOferta === "carta" ? item.nombre : item.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalText}>Mensaje</Text>

            <TextInput
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              style={styles.mensajeInput}
            />

            <View style={styles.priceButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setOfertaModal(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={enviarPropuesta}
              >
                <Text style={styles.confirmText}>Enviar</Text>
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
  fecha: {
    color: "#ffffff70",
    fontSize: 12,
    alignSelf: "flex-start",
  },
  offerModal: {
    width: "90%",
    backgroundColor: "#0d140f",
    padding: 15,
    borderRadius: 15,
  },

  cartaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
  },

  cartaSeleccionada: {
    backgroundColor: "#0f2a1d",
  },

  cartaMini: {
    width: 40,
    height: 60,
    borderRadius: 5,
  },

  mensajeInput: {
    width: "100%",
    backgroundColor: "#0f2a1d",
    borderWidth: 1,
    borderColor: "#00ff8850",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    minHeight: 60,
  },
  selectorBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#00ff88",
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
  },

  selectorActive: {
    backgroundColor: "#00ff88",
  },

  selectorText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
