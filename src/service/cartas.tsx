import { Carta } from "../types/carta";
import { api } from "./api";

export const getCartas = async (): Promise<Carta[] | null> => {
  const res = await api.get<Carta[]>("/cartas/list");
  if (!res) return null;
  return res.data;
};

export const crearCarta = async (data: {
  nombre: string;
  juego?: string;
  edicion?: string;
  numero?: string;
  rareza?: string;
  imagen_url?: string;
  descripcion?: string;
  tipo?: string[];
}): Promise<any | null> => {
  const res = await api.post("/cartas/create", data);
  if (!res) return null;
  return res.data;
};

export const eliminarCarta = async (id: number): Promise<any | null> => {
  const res = await api.delete(`/cartas/delete/${id}`);
  if (!res) return null;
  return res.data;
};

export const actualizarCarta = async (
  id: number,
  data: {
    nombre?: string;
    juego?: string;
    edicion?: string;
    numero?: string;
    rareza?: string;
    imagen_url?: string;
    descripcion?: string;
    tipo?: string[];
  },
) => {
  const res = await api.put(`/cartas/update/${id}`, data);
  return res.data;
};

export const buscarCartasMongo = async (
  nombre: string,
): Promise<any | null> => {
  const res = await api.get(`/cartas/buscar-mongo?nombre=${nombre}`);
  if (!res) return null;
  return res.data.resultados;
};

export const getCartaMongoById = async (id: string): Promise<any | null> => {
  const res = await api.get(`/cartas/mongo/${id}`);
  if (!res) return null;
  return res.data;
};

export const publicarCarta = async (
  id: number,
  data: { precio: number },
): Promise<any | null> => {
  const res = await api.post(`/cartas/publicar/${id}`, data);
  if (!res) return null;
  return res.data;
};
