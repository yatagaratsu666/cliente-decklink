import { Carta } from "../types/carta";
import { api } from "./api";

// 🔥 OBTENER CARTAS
export const getCartas = async (): Promise<Carta[]> => {
  const res = await api.get<Carta[]>("/cartas/list");
  return res.data;
};

// 🔥 CREAR CARTA
export const crearCarta = async (data: {
  nombre: string;
  juego?: string;
  edicion?: string;
  numero?: string;
  rareza?: string;
  imagen_url?: string;
  descripcion?: string;
  tipo?: string[];
}) => {
  const res = await api.post("/cartas/create", data);
  return res.data;
};

// 🔥 ELIMINAR CARTA
export const eliminarCarta = async (id: number) => {
  const res = await api.delete(`/cartas/delete/${id}`);
  return res.data;
};

// 🔥 ACTUALIZAR CARTA
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

export const buscarCartasMongo = async (nombre: string) => {
  const res = await api.get(`/cartas/buscar-mongo?nombre=${nombre}`);
  return res.data.resultados;
};

export const getCartaMongoById = async (id: string) => {
  const res = await api.get(`/cartas/mongo/${id}`);
  return res.data;
};

export const publicarCarta = async (id: number, data: { precio: number }) => {
  const res = await api.post(`/cartas/publicar/${id}`, data);
  return res.data;
};
