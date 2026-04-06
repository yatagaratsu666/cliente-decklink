import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import { AuthContextType, AuthResponse, User } from "../types/auth";
import { api } from "./api";

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      const savedToken = await AsyncStorage.getItem("token");
      const savedUser = await AsyncStorage.getItem("user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }

      setLoading(false);
    };

    loadStorage();
  }, []);

  const login = async (email: string, contrasena: string) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        contrasena,
      });

      const { token, user } = response.data;

      const userData: User = user || { email };

      setToken(token);
      setUser(userData);

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const register = async (data: {
  nombre_usuario: string;
  email: string;
  contrasena: string;
  foto_perfil: string;
}) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};
