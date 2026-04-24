import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comentario: string) => void;
}

export default function RatingModal({ visible, onClose, onSubmit }: Props) {
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => setRating(star)}>
        <Text style={[styles.star, rating >= star && styles.starActive]}>
          ★
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Calificar usuario</Text>

          <View style={styles.starsContainer}>{renderStars()}</View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submit}
              onPress={() => onSubmit(rating, comentario)}
            >
              <Text style={styles.submitText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "85%",
    backgroundColor: "#0d140f",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#00ff8850",
  },

  title: {
    color: "#00ff88",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },

  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },

  star: {
    fontSize: 30,
    color: "#555",
    marginHorizontal: 5,
  },

  starActive: {
    color: "#00ff88",
  },

  input: {
    backgroundColor: "#050805",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#00ff8830",
    marginBottom: 15,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancel: {
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
  },

  submit: {
    backgroundColor: "#00ff88",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
  },

  cancelText: {
    color: "#fff",
    textAlign: "center",
  },

  submitText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
  },
});
