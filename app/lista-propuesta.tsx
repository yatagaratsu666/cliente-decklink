import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getPropuestas,
  rechazarPropuesta,
  solicitarConfirmacion,
} from "@/src/service/propuesta";
import { getProfile } from "@/src/service/usuario";
import { useRouter } from "expo-router";

export default function PropuestasScreen() {
  const router = useRouter();

  const [propuestas, setPropuestas] = useState<any[]>([]);
  const [selectedPropuesta] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const [tipoVista, setTipoVista] = useState<"recibidas" | "enviadas">(
    "recibidas",
  );

  useEffect(() => {
    loadUser();
    loadPropuestas();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getProfile();

      if (!user) {
        console.log("Usuario no autenticado");
        return;
      }

      setUserId(user.id_usuario);
    } catch (error) {
      console.log("Error usuario", error);
    }
  };

  const loadPropuestas = async () => {
    try {
      const data = await getPropuestas();
      setPropuestas(data || []);
    } catch (error) {
      console.log("Error propuestas", error);
    }
  };

  const aceptar = async () => {
    try {
      if (!userId || !selectedPropuesta) return;

      await solicitarConfirmacion(selectedPropuesta.id_propuesta);

      Alert.alert("Solicitud enviada");

      // setModalVisible(false);
      loadPropuestas();
    } catch (error: any) {
      console.log("Error aceptar:", error.response?.data);
      console.log("Status:", error.response?.status);
    }
  };

  const rechazar = async () => {
    if (!selectedPropuesta) return;

    Alert.alert(
      "Rechazar propuesta",
      "¿Estás seguro de rechazar esta propuesta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Rechazar",
          style: "destructive",
          onPress: async () => {
            try {
              await rechazarPropuesta(selectedPropuesta.id_propuesta);

              Alert.alert("Propuesta rechazada");

              // setModalVisible(false);
              loadPropuestas();
            } catch (error) {
              console.log(error);
              Alert.alert("Error al rechazar");
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: any) => {
    const esMia = userId === item.id_usuario_propone;
    const soyDueno = userId === item.id_usuario_dueno;

    const getResumenIntercambio = (item: any) => {
      const ofreceCarta = item.nombre;
      const ofreceLote = item.nombre_lote_propone;

      const recibeCarta = item.nombre_carta_pub;
      const recibeLote = item.nombre_lote_pub;

      if (ofreceCarta && recibeCarta) {
        return `Carta: ${ofreceCarta} ⇄ Carta: ${recibeCarta}`;
      }

      if (ofreceCarta && recibeLote) {
        return `Carta: ${ofreceCarta} ⇄ Lote: ${recibeLote}`;
      }

      if (ofreceLote && recibeCarta) {
        return `Lote: ${ofreceLote} ⇄ Carta: ${recibeCarta}`;
      }

      if (ofreceLote && recibeLote) {
        return `Lote: ${ofreceLote} ⇄ Lote: ${recibeLote}`;
      }

      return "Intercambio";
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/chat",
            params: {
              chatId: item.id_chat,
              propuestaId: item.id_propuesta,
            },
          })
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => {
              if (!esMia) {
                router.push({
                  pathname: "/user-profile",
                  params: { id: item.id_usuario_propone },
                });
              }
            }}
          >
            <Image
              source={{
                uri: item.foto_perfil || "https://i.pravatar.cc/100",
              }}
              style={styles.avatarSmall}
            />

            <Text style={styles.username}>
              {esMia
                ? "Tú"
                : tipoVista === "recibidas"
                  ? `De: ${item.nombre_usuario}`
                  : `Para: ${item.nombre_usuario}`}
            </Text>
          </TouchableOpacity>

          <Text style={styles.badge}>{esMia ? "Enviada" : "Recibida"}</Text>
        </View>

        <Text style={styles.exchange}>{getResumenIntercambio(item)}</Text>

        {item.mensaje && <Text style={styles.message}>{item.mensaje}</Text>}

        {item.nombre && (
          <View style={styles.exchangeBox}>
            <Text style={styles.exchangeLabel}>
              {esMia ? "Ofreces" : "Te ofrecen"}
            </Text>

            <Text style={styles.exchangeMain}>
              {item.nombre || item.nombre_lote_propone || "—"}
            </Text>

            <Text style={styles.exchangeArrow}>⇄</Text>

            <Text style={styles.exchangeLabel}>
              {esMia ? "Recibes" : "Recibirías"}
            </Text>

            <Text style={styles.exchangeMain}>
              {item.nombre_carta_pub || item.nombre_lote_pub || "—"}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text
            style={[
              styles.estado,
              item.estado === "confirmacion" && { color: "#ffaa00" },
            ]}
          >
            {item.estado}
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: {
                  chatId: item.id_chat,
                  propuestaId: item.id_propuesta,
                },
              })
            }
          >
            <Text style={styles.chatBtn}>Ir al chat</Text>
          </TouchableOpacity>
        </View>

        {soyDueno && item.estado === "pendiente" && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.accept}
              onPress={async () => {
                try {
                  await solicitarConfirmacion(item.id_propuesta);
                  Alert.alert("Solicitud enviada");
                  loadPropuestas();
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              <Text style={styles.actionText}>Aceptar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reject}
              onPress={() => {
                Alert.alert("Rechazar propuesta", "¿Seguro?", [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Rechazar",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await rechazarPropuesta(item.id_propuesta);
                        loadPropuestas();
                      } catch (error) {
                        console.log(error);
                      }
                    },
                  },
                ]);
              }}
            >
              <Text style={styles.actionText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const isOwner =
    selectedPropuesta && userId === selectedPropuesta.id_usuario_dueno;

  const propuestasFiltradas = propuestas.filter((p) => {
    if (!userId) return false;

    return tipoVista === "recibidas"
      ? p.id_usuario_dueno === userId
      : p.id_usuario_propone === userId;
  });

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.switchBtn,
            tipoVista === "recibidas" && styles.switchActive,
          ]}
          onPress={() => setTipoVista("recibidas")}
        >
          <Text
            style={[
              styles.switchText,
              tipoVista === "recibidas" && styles.switchTextActive,
            ]}
          >
            Recibidas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.switchBtn,
            tipoVista === "enviadas" && styles.switchActive,
          ]}
          onPress={() => setTipoVista("enviadas")}
        >
          <Text
            style={[
              styles.switchText,
              tipoVista === "enviadas" && styles.switchTextActive,
            ]}
          >
            Enviadas
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={propuestasFiltradas}
        keyExtractor={(item) => item.id_propuesta.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {tipoVista === "recibidas"
                ? "No has recibido propuestas"
                : "No has enviado propuestas"}
            </Text>

            <Text style={styles.emptySubtitle}>
              {tipoVista === "recibidas"
                ? "Publica cartas o lotes para empezar a recibir ofertas."
                : "Explora publicaciones y realiza propuestas para intercambiar."}
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/inicio")}
            >
              <Text style={styles.emptyButtonText}>Ir a publicaciones</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050805",
    padding: 16,
  },

  card: {
    backgroundColor: "#0d140f",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#00ff8830",
  },

  title: {
    color: "#00ff88",
    fontWeight: "bold",
    fontSize: 16,
  },

  text: {
    color: "#ccc",
    marginTop: 5,
  },

  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },

  emptyText: {
    color: "#aaa",
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "90%",
    backgroundColor: "#050805",
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    color: "#00ff88",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  modalText: {
    color: "#ccc",
  },

  buttons: {
    marginTop: 20,
    gap: 10,
  },

  chat: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 8,
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },

  close: {
    color: "#00ff88",
    textAlign: "center",
    marginTop: 15,
  },
  switchContainer: {
    flexDirection: "row",
    backgroundColor: "#0d140f",
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#00ff8830",
    overflow: "hidden",
  },

  switchBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  switchActive: {
    backgroundColor: "#00ff88",
  },

  switchText: {
    color: "#aaa",
    fontWeight: "bold",
  },

  switchTextActive: {
    color: "#000",
  },

  emptyTitle: {
    color: "#00ff88",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  emptySubtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },

  emptyButton: {
    backgroundColor: "#00ff88",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  username: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },

  tipoLabel: {
    color: "#aaa",
    fontSize: 11,
  },

  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    fontSize: 11,
    color: "#000",
    backgroundColor: "#00ff88",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },

  message: {
    color: "#ccc",
    marginTop: 6,
    fontSize: 13,
  },

  cartaBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#050805",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00ff8830",
  },

  cartaTitle: {
    color: "#aaa",
    fontSize: 11,
    marginBottom: 3,
  },

  cartaNombre: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  cartaMeta: {
    color: "#00ff88",
    fontSize: 11,
  },

  footer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  estado: {
    color: "#00ff88",
    fontSize: 12,
    fontWeight: "bold",
  },

  chatHint: {
    color: "#666",
    fontSize: 11,
  },
  chatBtn: {
    color: "#00ff88",
    fontSize: 12,
    fontWeight: "bold",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  actionText: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },

  accept: {
    flex: 1,
    backgroundColor: "#00ff88",
    padding: 10,
    borderRadius: 8,
  },

  reject: {
    flex: 1,
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 8,
  },
  exchange: {
    color: "#00ff88",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "bold",
  },

  exchangeBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00ff8830",
    backgroundColor: "#050805",
    alignItems: "center",
  },

  exchangeLabel: {
    color: "#888",
    fontSize: 11,
  },

  exchangeMain: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },

  exchangeArrow: {
    color: "#00ff88",
    fontSize: 16,
    marginVertical: 5,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 50,
    borderWidth: 1,
  },
});
