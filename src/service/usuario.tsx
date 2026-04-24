import { User } from "../types/usuario";
import { api } from "./api";

export const getProfile = async (): Promise<User | null> => {
  const res = await api.get<User>("/auth/me");

  if (!res) return null;

  return res.data;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const res = await api.get<User>(`/auth/profile/${id}`);

  if (!res) return null;

  return res.data;
};

export const calificarUsuario = async (data: {
  id_usuario_calificado: number;
  puntuacion: number;
  comentario?: string;
}) => {
  const res = await api.post("/auth/calificar", data);
  if (!res) return null;
  return res.data;
};

export const getResenasUsuario = async (id: number) => {
  const res = await api.get(`/auth/resenas/${id}`);

  if (!res) return [];

  return res.data;
};
