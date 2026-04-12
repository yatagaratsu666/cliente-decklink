import { Publicacion } from "../types/publicacion";
import { api } from "./api";

// 🔥 OBTENER TODO LO PUBLICADO (cartas + lotes)
export const getPublicaciones = async (): Promise<Publicacion[]> => {
  const res = await api.get<Publicacion[]>("/cartas/publicadas");
  return res.data;
};
