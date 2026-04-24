import { getCartas } from "@/src/service/cartas";
import { getLotes } from "@/src/service/lote";
import { crearPropuesta } from "@/src/service/propuesta";
import { despublicarLote } from "@/src/service/publicacion";
import { getProfile } from "@/src/service/usuario";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoteModal({ visible, lote, onClose, onEliminar }: any) {
  const router = useRouter();
  const [usuarioLogeado, setUsuarioLogeado] = useState<any>(null);

  const [ofertaModal, setOfertaModal] = useState(false);
  const [mensaje, setMensaje] = useState("Hola, me interesa este lote");

  const [tipoOferta, setTipoOferta] = useState<"carta" | "lote">("carta");

  const [misCartas, setMisCartas] = useState<any[]>([]);
  const [misLotes, setMisLotes] = useState<any[]>([]);

  const [seleccionado, setSeleccionado] = useState<any>(null);

  useEffect(() => {
    const cargar = async () => {
      const user = await getProfile();
      setUsuarioLogeado(user);
    };
    cargar();
  }, []);

  if (!lote) return null;

  const esPropia =
    usuarioLogeado && lote.usuario?.id_usuario === usuarioLogeado.id_usuario;

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const cargarDatos = async () => {
    const cartas = await getCartas();
    const lotes = await getLotes();

    setMisCartas(cartas || []);
    setMisLotes(lotes || []);
  };

  const eliminarPublicacionLote = async () => {
    Alert.alert("Eliminar publicación", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            if (lote && "id_publicacion" in lote) {
              await despublicarLote(lote.id_publicacion);
              onEliminar?.(lote.id_publicacion);
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

      const payload: any = {
        id_publicacion: lote.id_publicacion,
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
      console.log("ID LOTE:", seleccionado?.id_lote);

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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Set de Cartas</Text>

          {lote.usuario && (
            <TouchableOpacity
              style={styles.userBlockRight}
              onPress={() =>
                router.push({
                  pathname: "/user-profile",
                  params: { id: lote.usuario.id_usuario },
                })
              }
            >
              <Image
                source={{ uri: lote.usuario?.foto_perfil }}
                style={styles.avatarBig}
              />

              <View style={styles.userTextBox}>
                <Text style={styles.usernameBig}>
                  {lote.usuario?.nombre_usuario}
                </Text>

                <Text style={styles.reputacion}>
                  ⭐ {lote.usuario?.reputacion}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <Text style={styles.precio}>${lote.precio}</Text>
          <Text style={styles.fecha}>
            {formatearFecha(lote.fecha_publicacion)}
          </Text>

          <Text style={styles.subTitle}>Cartas del lote</Text>

          <ScrollView style={{ maxHeight: 300 }}>
            {lote.cartas?.map((c: any) => (
              <View key={c.id_carta} style={styles.cardItem}>
                <Image source={{ uri: c.imagen_url }} style={styles.cardImg} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{c.nombre}</Text>
                  <Text style={styles.cardMeta}>{c.juego}</Text>
                  <Text style={styles.cardMeta}>{c.edicion}</Text>
                  <Text style={styles.cardMeta}>{c.numero}</Text>
                  <Text style={styles.cardMeta}>{c.rareza}</Text>

                  <View style={styles.tipoContainer}>
                    {c.tipo?.map((t: string, i: number) => (
                      <View key={i} style={styles.tipoBadge}>
                        <Text style={styles.tipoText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalButtons}>
            {!esPropia ? (
              <View style={styles.marketButtons}>
                <TouchableOpacity style={styles.buyBtn}>
                  <Text style={styles.buyText}>Comprar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.offerBtn} onPress={abrirOferta}>
                  <Text style={styles.offerText}>Ofertar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  if (lote && "id_publicacion" in lote) {
                    eliminarPublicacionLote();
                  }
                }}
              >
                <Text style={styles.deleteText}>Eliminar publicación</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={ofertaModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.offerModal}>
            <Text style={styles.title}>Crear Propuesta</Text>

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

            <ScrollView style={{ maxHeight: 200 }}>
              {(tipoOferta === "carta" ? misCartas : misLotes).map((item) => (
                <TouchableOpacity
                  key={tipoOferta === "carta" ? item.id_carta : item.id_lote}
                  style={[
                    styles.itemSelect,
                    seleccionado === item && styles.itemSelected,
                  ]}
                  onPress={() => setSeleccionado(item)}
                >
                  {tipoOferta === "carta" ? (
                    <Image
                      source={{ uri: item.imagen_url }}
                      style={styles.miniImg}
                    />
                  ) : null}

                  <Text style={{ color: "#fff" }}>
                    {tipoOferta === "carta" ? item.nombre : item.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.subTitle}>Mensaje</Text>

            <TextInput
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              style={styles.input}
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setOfertaModal(false)}
              >
                <Text style={{ color: "#00ff88" }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={enviarPropuesta}
              >
                <Text style={{ color: "#000" }}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "92%",
    backgroundColor: "#0d140f",
    borderRadius: 15,
    padding: 15,
  },

  title: {
    color: "#00ff88",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  subTitle: {
    color: "#fff",
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },

  userBlockRight: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    gap: 10,
    backgroundColor: "#0a1d14",
    borderWidth: 1,
    borderColor: "#00ff8828",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
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

  userTextBox: {
    alignItems: "flex-start",
  },

  reputacion: {
    color: "#00ff88",
    fontSize: 12,
  },

  precio: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },

  fecha: {
    color: "#aaa",
    fontSize: 12,
  },

  cardItem: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    backgroundColor: "#0f2a1d",
    padding: 8,
    borderRadius: 10,
  },

  cardImg: {
    width: 70,
    height: 100,
    borderRadius: 6,
  },

  cardName: {
    color: "#fff",
    fontWeight: "bold",
  },

  cardMeta: {
    color: "#aaa",
    fontSize: 11,
  },

  tipoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 5,
  },

  tipoBadge: {
    backgroundColor: "#0d140f",
    borderWidth: 1,
    borderColor: "#00ff8850",
    paddingHorizontal: 6,
    borderRadius: 10,
  },

  tipoText: {
    color: "#00ff88",
    fontSize: 10,
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
    alignItems: "center",
  },

  marketButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },

  buyBtn: {
    flex: 1,
    backgroundColor: "#00ff88",
    padding: 12,
    borderRadius: 10,
  },

  offerBtn: {
    flex: 1,
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
    color: "#00ff88",
    fontWeight: "bold",
  },

  deleteBtn: {
    width: "100%",
    backgroundColor: "#0f2a1d",
    borderWidth: 1,
    borderColor: "#00ff88",
    padding: 12,
    borderRadius: 10,
  },

  deleteText: {
    color: "#00ff88",
    textAlign: "center",
    fontWeight: "bold",
  },

  close: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  closeText: {
    color: "#00ff88",
    fontSize: 26,
  },
  offerModal: {
    width: "90%",
    backgroundColor: "#0d140f",
    padding: 15,
    borderRadius: 15,
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

  itemSelect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
  },

  itemSelected: {
    backgroundColor: "#0f2a1d",
  },

  miniImg: {
    width: 40,
    height: 60,
    borderRadius: 5,
  },

  input: {
    width: "100%",
    backgroundColor: "#0f2a1d",
    borderWidth: 1,
    borderColor: "#00ff8850",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    minHeight: 60,
  },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#00ff88",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  confirmBtn: {
    flex: 1,
    backgroundColor: "#00ff88",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});
