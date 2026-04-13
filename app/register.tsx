import { register } from "@/src/service/auth";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [imagen, setImagen] = useState<string | null>(null);

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert("Permiso requerido", "Debes permitir acceso a galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.4,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      const base64 = result.assets[0].base64;
      setImagen(`data:image/jpeg;base64,${base64}`);
    }
  };

  const handleRegister = async () => {
    if (!nombre || !email || !contrasena || !imagen) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      await register({
        nombre_usuario: nombre,
        email,
        contrasena,
        foto_perfil: imagen,
      });

      Alert.alert("Éxito", "Usuario registrado");

      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeIcon} onPress={() => router.back()}>
        <Text style={styles.closeX}>×</Text>
      </TouchableOpacity>

      <Text style={styles.title}>REGISTRATE</Text>

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Nombre de usuario"
          placeholderTextColor="#888"
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
        />

        <TextInput
          placeholder="Correo"
          placeholderTextColor="#888"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#888"
          secureTextEntry
          style={styles.input}
          value={contrasena}
          onChangeText={setContrasena}
        />
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={seleccionarImagen}>
        {imagen && <Image source={{ uri: imagen }} style={styles.preview} />}

        <Text style={styles.imageText}>
          {imagen ? "Cambiar imagen" : "Seleccionar foto de perfil"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050805",
    padding: 20,
    paddingTop: 50,
  },

  title: {
    paddingTop: 102,
    color: "#00ff88",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(97, 142, 97, 0.32)",
  },

  formContainer: {
    marginTop: 5,
  },

  input: {
    backgroundColor: "#0d140f",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#00ff8830",
  },

  imagePicker: {
    backgroundColor: "#0d140f",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00ff8830",
    marginTop: 10,
  },

  preview: {
    width: 85,
    height: 85,
    borderRadius: 50,
    marginBottom: 10,
  },

  imageText: {
    color: "#00ff88",
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#00ff88",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },

  buttonText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  closeIcon: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },

  closeX: {
    color: "#00ff88",
    fontSize: 35,
    fontWeight: "bold",
  },
});
