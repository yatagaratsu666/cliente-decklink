import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getMensajes } from "@/src/service/chat";
import { aceptarPropuesta } from "@/src/service/propuesta";
import socket from "@/src/service/socket";
import { calificarUsuario, getProfile } from "@/src/service/usuario";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import RatingModal from "./rating-modal";

interface Message {
  id?: number | string;
  message?: string;
  userId: number;

  tipo?: string;

  propuestaUser?: number;

  tipoContenido?: "carta" | "lote";

  carta?: {
    nombre: string;
    juego?: string;
    edicion?: string;
    numero?: string;
    rareza?: string;
    imagen_url?: string;
    descripcion?: string;
    tipoCarta?: string[];
  };

  lote?: {
    nombre: string;
    cartas: {
      imagen_url: string;
      nombre: string;
      juego?: string;
      edicion?: string;
      numero?: string;
      rareza?: string;
    }[];
  };
}

export default function ChatScreen() {
  const params = useLocalSearchParams();

  const router = useRouter();

  const chatId = Number(params.chatId);
  const [userId, setUserId] = useState<number | null>(null);

  const [ratingVisible, setRatingVisible] = useState(false);
  const [usuarioAcalificar, setUsuarioAcalificar] = useState<number | null>(
    null,
  );

  const [confirmacionEstado, setConfirmacionEstado] = useState<
    "pendiente" | "aceptado" | "rechazado"
  >("pendiente");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const flatListRef = React.useRef<FlatList>(null);

  const insets = useSafeAreaInsets();

  const propuestaId = Number(params.propuestaId);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getProfile();
        setUserId(user!.id_usuario);
      } catch (error) {
        console.log("Error cargando usuario", error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const loadMessages = async () => {
      try {
        const data = await getMensajes(chatId);

        const parsed = data.flatMap((m: any, index: number) => {
          const mensajes: Message[] = [];

          const esPrimerMensaje = index === 0;

          const esCarta = esPrimerMensaje && m.nombre && m.imagen_url;
          const esLote = esPrimerMensaje && m.es_lote;

          if (esLote) {
            mensajes.push({
              id: `${m.id_mensaje}-lote`,
              userId: m.id_emisor,
              propuestaUser: m.id_usuario_propone,
              tipoContenido: "lote",
              lote: {
                nombre: m.nombre_lote,
                cartas: m.cartas || [],
              },
            });
          }

          if (esCarta) {
            mensajes.push({
              id: `${m.id_mensaje}-card`,
              userId: m.id_emisor,
              propuestaUser: m.id_usuario_propone,
              tipoContenido: "carta",
              carta: {
                nombre: m.nombre,
                juego: m.juego,
                edicion: m.edicion,
                numero: m.numero,
                rareza: m.rareza,
                imagen_url: m.imagen_url,
                descripcion: m.descripcion,
                tipoCarta: m.tipo_carta ? m.tipo_carta.split(",") : [],
              },
            });
          }

          if (m.mensaje) {
            mensajes.push({
              id: `${m.id_mensaje}`,
              userId: m.id_emisor,
              message: m.mensaje,
              tipo: m.tipo || "texto",
            });
          }

          return mensajes;
        });

        const unique = [];
        const ids = new Set();

        for (const m of parsed) {
          const baseId = m.id?.toString().split("-")[0];

          if (!ids.has(baseId + m.tipoContenido)) {
            ids.add(baseId + m.tipoContenido);
            unique.push(m);
          }
        }

        setMessages(parsed);
      } catch (error: any) {
        console.log("Error completo:", error.response?.data);
        console.log("Status:", error.response?.status);
      }
    };

    loadMessages();

    const join = () => {
      socket.emit("joinChat", chatId);
    };

    if (!socket.connected) {
      socket.connect();
      socket.on("connect", join);
    } else {
      join();
    }

    socket.on("newMessage", (data: any) => {
      setMessages((prev) => {
        const exists = prev.some((m) =>
          m.id?.toString().startsWith(data.id_mensaje.toString()),
        );

        if (exists) return prev;

        return [
          ...prev,
          {
            id: `${data.id_mensaje}`,
            userId: data.id_emisor,
            message: data.mensaje,
            tipo: data.tipo || "texto",
          },
        ];
      });
    });

    return () => {
      socket.off("newMessage");
      socket.off("connect", join);
    };
  }, [chatId]);

  const sendMessage = () => {
    if (!message.trim() || !userId) return;

    socket.emit("sendMessage", {
      chatId,
      userId,
      message,
    });

    setMessage("");
  };

  const confirmar = async () => {
    if (!propuestaId || !userId) return;

    try {
      await aceptarPropuesta(propuestaId);

      // 🔥 detectar a quién calificar
      const otroUsuario = messages.find((m) => m.userId !== userId)?.userId;

      if (otroUsuario) {
        setUsuarioAcalificar(otroUsuario);
        setRatingVisible(true);
      } else {
        router.replace("/lista-propuesta");
      }
    } catch (error: any) {
      console.log("Error confirmar:", error.response?.data);
    }
  };

  const enviarRating = async (rating: number, comentario: string) => {
    if (!usuarioAcalificar) return;

    try {
      await calificarUsuario({
        id_usuario_calificado: usuarioAcalificar,
        puntuacion: rating,
        comentario,
      });

      setRatingVisible(false);

      router.replace("/lista-propuesta");
    } catch (error) {
      console.log(error);
    }
  };

  const rechazarConfirmacion = () => {
    if (!userId) return;

    socket.emit("rechazarConfirmacion", {
      chatId,
      userId,
    });

    setConfirmacionEstado("rechazado");
  };

  const renderItem = ({ item }: { item: Message }) => {
    console.log("Mensaje:", item);
    const isCarta = item.tipoContenido === "carta";
    const isLote = item.tipoContenido === "lote";

    const isConfirmacion = item.tipo === "confirmacion";

    const isMine =
      userId !== null &&
      (isCarta || isLote
        ? item.propuestaUser === userId
        : item.userId === userId);

    return (
      <View
        style={[styles.messageRow, isMine ? styles.myRow : styles.otherRow]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myMessage : styles.otherMessage,
            isCarta && styles.cardMessage,
          ]}
        >
          {isCarta && item.carta && (
            <View>
              <Image
                source={{ uri: item.carta.imagen_url }}
                style={styles.cardImage}
              />

              <Text style={[styles.cardName, isMine && styles.myText]}>
                {item.carta.nombre}
              </Text>

              {item.carta.juego && (
                <Text style={[styles.cardText, isMine && styles.myText]}>
                  Juego: {item.carta.juego}
                </Text>
              )}

              {item.carta.edicion && (
                <Text style={[styles.cardText, isMine && styles.myText]}>
                  Edición: {item.carta.edicion}
                </Text>
              )}

              {item.carta.numero && (
                <Text style={[styles.cardText, isMine && styles.myText]}>
                  Nº: {item.carta.numero}
                </Text>
              )}

              {item.carta.rareza && (
                <Text style={[styles.cardText, isMine && styles.myText]}>
                  Rareza: {item.carta.rareza}
                </Text>
              )}

              {item.carta.descripcion && (
                <Text style={[styles.cardDescription, isMine && styles.myText]}>
                  {item.carta.descripcion}
                </Text>
              )}

              {item.carta?.tipoCarta?.length ? (
                <Text style={[styles.cardText, isMine && styles.myText]}>
                  Tipo: {item.carta.tipoCarta.join(", ")}
                </Text>
              ) : null}
            </View>
          )}

          {isLote && item.lote && (
            <View style={styles.loteContainer}>
              <Text style={styles.loteTitle}>{item.lote.nombre}</Text>

              <Text style={styles.loteSubtitle}>
                {item.lote.cartas.length} cartas
              </Text>

              <View style={styles.loteGrid}>
                {item.lote.cartas.map((c, index) => (
                  <View key={index} style={styles.loteCard}>
                    <Image
                      source={{ uri: c.imagen_url }}
                      style={styles.loteImg}
                    />

                    <View style={styles.loteInfo}>
                      <Text style={styles.loteCardName} numberOfLines={1}>
                        {c.nombre}
                      </Text>

                      {/* Si luego agregas más datos desde backend */}
                      {c.rareza && (
                        <Text style={styles.loteMeta}>⭐ {c.rareza}</Text>
                      )}

                      {c.juego && (
                        <Text style={styles.loteMeta}>{c.juego}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {item.message && (
            <Text style={[styles.messageText, isMine && styles.myText]}>
              {item.message}
            </Text>
          )}
          {item.tipo === "confirmacion" && userId !== null && (
            <>
              {Number(item.userId) !== Number(userId) ? (
                <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
                  <TouchableOpacity
                    disabled={confirmacionEstado !== "pendiente"}
                    style={{
                      backgroundColor:
                        confirmacionEstado === "pendiente" ? "#00ff88" : "#666",
                      padding: 8,
                      borderRadius: 8,
                      opacity: confirmacionEstado === "pendiente" ? 1 : 0.6,
                    }}
                    onPress={confirmar}
                  >
                    <Text style={{ color: "#000" }}>Confirmar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={confirmacionEstado !== "pendiente"}
                    style={{
                      backgroundColor:
                        confirmacionEstado === "pendiente" ? "#ff4444" : "#666",
                      padding: 8,
                      borderRadius: 8,
                      opacity: confirmacionEstado === "pendiente" ? 1 : 0.6,
                    }}
                    onPress={rechazarConfirmacion}
                  >
                    <Text style={{ color: "#fff" }}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={{
                    marginTop: 10,
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: "#22222294",
                    borderWidth: 1,
                    borderColor: "#00ff8830",
                  }}
                >
                  <Text style={{ color: "#e1e1e1", fontSize: 13 }}>
                    Esperando confirmación del otro usuario...
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={60}
      >
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={messages}
            style={{ flex: 1 }}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
          />

          <View
            style={[
              styles.inputContainer,
              { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={sendMessage}
            />

            <TouchableOpacity style={styles.button} onPress={sendMessage}>
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <RatingModal
          visible={ratingVisible}
          onClose={() => setRatingVisible(false)}
          onSubmit={enviarRating}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050805",
  },

  messageRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  myRow: {
    justifyContent: "flex-end",
  },

  otherRow: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    width: "75%",
    padding: 12,
    borderRadius: 16,
  },

  myMessage: {
    backgroundColor: "#00ff88",
    borderTopRightRadius: 4,
    shadowColor: "#00ff88",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },

  otherMessage: {
    backgroundColor: "#0d140f",
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#00ff8830",
  },

  messageText: {
    color: "#fff",
  },

  cardMessage: {
    padding: 10,
  },

  cardImage: {
    width: 220,
    height: 310,
  },

  cardName: {
    color: "#00ff88",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },

  cardText: {
    color: "#ccc",
    fontSize: 13,
    marginBottom: 2,
  },

  cardDescription: {
    color: "#aaa",
    fontSize: 12,
  },

  inputContainer: {
    flexDirection: "row",
    padding: 12,
    paddingBottom: 5,
    borderTopWidth: 1,
    borderColor: "#00ff8830",
    backgroundColor: "#050805",
  },

  messages: {
    padding: 16,
  },

  input: {
    flex: 1,
    backgroundColor: "#0d140f",
    borderRadius: 12,
    paddingHorizontal: 12,
    color: "#fff",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#00ff8830",
  },

  button: {
    backgroundColor: "#00ff88",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },
  screen: {
    flex: 1,
    backgroundColor: "#050805",
  },
  loteTitle: {
    color: "#00ff88",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },

  loteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  loteCard: {
    width: 75,
    backgroundColor: "#0f2a1d",
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00ff8830",
    alignItems: "center",
  },

  loteImg: {
    width: 65,
    height: 90,
    borderRadius: 6,
    marginBottom: 4,
  },

  loteText: {
    color: "#aaa",
    fontSize: 10,
    textAlign: "center",
  },
  loteContainer: {
    width: "100%",
  },

  loteSubtitle: {
    color: "#888",
    fontSize: 12,
    marginBottom: 10,
  },

  loteInfo: {
    paddingHorizontal: 2,
  },

  loteCardName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  loteMeta: {
    color: "#00ff88",
    fontSize: 10,
  },
  myText: {
    color: "#000",
  },
});
