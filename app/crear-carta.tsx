import { actualizarCarta, crearCarta } from "@/src/service/cartas";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CrearCarta() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [rareza, setRareza] = useState("");
  const [estado, setEstado] = useState("");
  const [imagen, setImagen] = useState<string | null>(null);

  const params = useLocalSearchParams();
  const cartaEdit = params.carta ? JSON.parse(params.carta as string) : null;

  const isEditing = !!cartaEdit;

  useEffect(() => {
    if (cartaEdit) {
      setNombre(cartaEdit.nombre);
      setCategoria(cartaEdit.categoria);
      setRareza(cartaEdit.rareza);
      setEstado(cartaEdit.estado);
      setImagen(cartaEdit.imagen);
    }
  }, []);

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert("Permiso requerido", "Debes permitir acceso a galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const base64 = result.assets[0].base64;

      setImagen(`data:image/jpeg;base64,${base64}`);
    }
  };

  const handleGuardar = async () => {
    if (!nombre || !categoria || !rareza || !estado || !imagen) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      if (isEditing) {
        await actualizarCarta(cartaEdit.id_carta, {
          nombre,
          categoria,
          rareza,
          estado,
          imagen,
        });

        Alert.alert("Éxito", "Carta actualizada");
      } else {
        await crearCarta({
          nombre,
          categoria,
          rareza,
          estado,
          imagen,
        });

        Alert.alert("Éxito", "Carta creada");
      }

      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cancelTop}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.cancelTopText}>×</Text>
      </TouchableOpacity>
      <Text style={styles.title}>
        {isEditing ? "Editar Carta" : "Nueva Carta"}
      </Text>

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Nombre"
          placeholderTextColor="#888"
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
        />

        <TextInput
          placeholder="Categoría"
          placeholderTextColor="#888"
          style={styles.input}
          value={categoria}
          onChangeText={setCategoria}
        />

        <TextInput
          placeholder="Rareza"
          placeholderTextColor="#888"
          style={styles.input}
          value={rareza}
          onChangeText={setRareza}
        />

        <TextInput
          placeholder="Estado"
          placeholderTextColor="#888"
          style={styles.input}
          value={estado}
          onChangeText={setEstado}
        />
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={seleccionarImagen}>
        {imagen && <Image source={{ uri: imagen }} style={styles.preview} />}

        <Text style={styles.imageText}>
          {imagen ? "Cambiar imagen" : "Seleccionar imagen"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>
          {isEditing ? "Actualizar Carta" : "Crear Carta"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050805",
    padding: 20,
  },

  title: {
    paddingTop: 25,
    color: "#00ff88",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(97, 142, 97, 0.32)",
  },

  input: {
    backgroundColor: "#0d140f",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#00ff8830",
  },

  imagePicker: {
    backgroundColor: "#0d140f",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#00ff8830",
  },

  imageText: {
    color: "#00ff88",
    fontWeight: "bold",
  },

  preview: {
    width: 85,
    height: 85,
    borderRadius: 50,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#00ff88",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: "#000",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelTop: {
    position: "absolute",
    top: 8,
    left: 20,
    zIndex: 10,
  },

  cancelTopText: {
    color: "#00ff88",
    fontSize: 35,
    fontWeight: "bold",
  },

  formContainer: {
    marginTop: 5,
  },
});
