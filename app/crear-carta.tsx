import { buscarCartasMongo, crearCarta } from "@/src/service/cartas";
import { CartaMongo } from "@/src/types/carta";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BuscarCarta() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<CartaMongo[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});

  const buscar = async (text: string) => {
    setQuery(text);

    if (text.length < 4) {
      setResultados([]);
      return;
    }

    try {
      const data = await buscarCartasMongo(text);
      setResultados(data);
    } catch (error) {
      console.log(error);
    }
  };

  const agregar = (id: string) => {
    setSelected((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const quitar = (id: string) => {
    setSelected((prev) => {
      const nuevo = { ...prev };

      if (!nuevo[id]) return prev;

      nuevo[id]--;

      if (nuevo[id] <= 0) delete nuevo[id];

      return nuevo;
    });
  };

  const guardar = async () => {
    try {
      const seleccionadas = resultados.filter((c) => selected[c.id_carta]);

      for (const carta of seleccionadas) {
        const cantidad = selected[carta.id_carta];

        for (let i = 0; i < cantidad; i++) {
          await crearCarta({
            nombre: carta.nombre,
            juego: carta.juego,
            edicion: carta.edicion,
            numero: carta.numero,
            rareza: carta.rareza,
            imagen_url: carta.imagen_url,
            descripcion: carta.descripcion,
            tipo: carta.tipo,
          });
        }
      }

      Alert.alert("Éxito", "Cartas agregadas");
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", "No se pudieron agregar");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={{ flex: 1 }}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Buscar Carta</Text>

          <TouchableOpacity
            style={styles.lotesBtn}
            onPress={() => router.replace("/home")}
          >
            <Ionicons name="arrow-back" size={20} color="#000" />
            <Text style={styles.lotesText}>Volver</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Escribe al menos 4 letras..."
          placeholderTextColor="#888"
          style={styles.input}
          value={query}
          onChangeText={buscar}
        />

        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id_carta}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 100 }} // 👈 espacio para FAB
          renderItem={({ item }) => {
            const id = item.id_carta;
            const count = selected[id] || 0;

            return (
              <View style={styles.card}>
                <Image source={{ uri: item.imagen_url }} style={styles.image} />

                <View style={styles.content}>
                  <Text style={styles.name}>{item.nombre}</Text>

                  <Text style={styles.tipo}>{item.tipo?.join(" • ")}</Text>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => quitar(id)}
                    >
                      <Text style={styles.btn}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.count}>{count}</Text>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => agregar(id)}
                    >
                      <Text style={styles.btn}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />

        {Object.keys(selected).length > 0 && (
          <TouchableOpacity style={styles.fab} onPress={guardar}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050805",
    paddingHorizontal: 10,
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

  content: {
    flex: 1,
    paddingBottom: 10,
  },

  name: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    paddingLeft: 10,
  },

  tipo: {
    color: "#888",
    fontSize: 10,
    marginTop: 2,
    paddingLeft: 10,
    marginRight: 10,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    gap: 20,
  },

  actionBtn: {
    marginTop: 10,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#0f2a1d",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00ff8850",
  },

  btn: {
    color: "#00ff88",
    fontSize: 22,
    fontWeight: "bold",
  },

  count: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#0d140f",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#00ff8830",
    marginBottom: 12,
  },

  fab: {
    position: "absolute",
    bottom: 20, // 👈 dinámico y correcto
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "#00ff88",
    justifyContent: "center",
    alignItems: "center",
  },

  fabText: {
    color: "#000",
    fontSize: 30,
    fontWeight: "bold",
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
});
