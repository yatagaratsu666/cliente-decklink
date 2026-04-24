import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  carta: any;
  onPress?: () => void;
}

export default function CartaCard({ carta, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {carta.estado === "aceptada" && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>INTERCAMBIADA</Text>
        </View>
      )}
      <Image source={{ uri: carta.imagen_url || "" }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{carta.nombre}</Text>
        <Text style={styles.category}>{carta.juego}</Text>
        <Text style={styles.rareza}>{carta.rareza}</Text>

        <Text style={styles.tipo}>
          {Array.isArray(carta.tipo)
            ? carta.tipo.join(", ")
            : carta.tipo || "Sin tipo"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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

  tipo: {
    color: "#888",
    fontSize: 10,
    marginTop: 2,
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#00ff88",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 10,
  },

  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },
});
