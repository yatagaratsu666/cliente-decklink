import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config/env";
import { forceLogout } from "./authGlobal";
import { eventBus } from "./eventBus";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 403) {
      console.log("Token inválido");

      await forceLogout();
      eventBus.emit("logout");

      return Promise.resolve(null);
    }

    if (error.response?.status === 403) {
      const msg = error.response?.data?.message;

      if (msg === "Token inválido") {
        console.log("Token inválido");

        await forceLogout();
        eventBus.emit("logout");
      }

      return Promise.resolve(null);
    }

    return Promise.reject(error);
  },
);
