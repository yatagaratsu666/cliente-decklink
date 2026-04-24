import { Publicacion } from "../types/publicacion";
import { api } from "./api";

export const getPublicaciones = async (): Promise<Publicacion[] | null> => {
  const res = await api.get<Publicacion[]>("/cartas/publicadas");
  if (!res) return null;
  return res.data;
};

export const getPublicacionesUsuario = async (
  userId: number,
): Promise<Publicacion[] | null> => {
  const res = await api.get(`/cartas/publicaciones/${userId}`);
  if (!res) return null;
  return res.data;
};

export const buscarCartas = async (query: string): Promise<Publicacion[]> => {
  if (!query || query.length < 2) return [];

  const res = await api.get(`/cartas/publicadas/buscar?q=${query}`);

  if (!res) return [];

  return res.data;
};

export const buscarLotes = async (query: string): Promise<any[]> => {
  if (!query || query.length < 2) return [];

  const res = await api.get(`/lotes/publicados/buscar?q=${query}`);

  if (!res) return [];

  return res.data;
};

export const despublicarCarta = async (
  id_publicacion: number,
): Promise<any | null> => {
  const res = await api.put(`/cartas/despublicar/${id_publicacion}`);
  if (!res) return null;
  return res.data;
};

export const despublicarLote = async (
  id_publicacion: number,
): Promise<any | null> => {
  const res = await api.put(`/lotes/despublicar/${id_publicacion}`);
  if (!res) return null;
  return res.data;
};
