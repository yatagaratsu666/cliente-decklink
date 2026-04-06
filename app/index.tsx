import { AuthContext } from "@/src/service/auth";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen: React.FC = () => {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !contrasena) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      await login(email, contrasena);
      router.replace("/home");
    } catch {
      Alert.alert("Error", "Credenciales inválidas");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/decklink-logo.png")}
        style={styles.logoImage}
      />
      <Text style={styles.logo}>DECKLINK</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>¿No tienes cuenta?</Text>

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.registerLink}> Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050805",
    justifyContent: "center",
    paddingHorizontal: 25,
    marginTop: -38,
  },

  logo: {
    color: "#00ff88",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 8,
  },

  subtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(97, 142, 97, 0.32)",
  },

  input: {
    backgroundColor: "#0d140f",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    color: "#fff",
    fontSize: 15,

    borderWidth: 1,
    borderColor: "#00ff8830",
  },

  button: {
    backgroundColor: "#00ff88",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,

    shadowColor: "#00ff88",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  buttonText: {
    color: "#000",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  registerText: {
    color: "#aaa",
    fontSize: 14,
  },

  registerLink: {
    color: "#00ff88",
    fontSize: 14,
    fontWeight: "bold",
  },

  logoImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 5,
  },
});
