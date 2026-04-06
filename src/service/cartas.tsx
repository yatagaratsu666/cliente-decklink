import { Carta } from "../types/carta";
import { api } from "./api";

export const getCartas = async (): Promise<Carta[]> => {
  const res = await api.get<Carta[]>("/cartas/list");

  return res.data;
};

export const crearCarta = async (data: {
  nombre: string;
  categoria: string;
  rareza: string;
  estado: string;
  imagen: string;
}) => {
  const res = await api.post("/cartas/create", data);
  return res.data;
};

export const eliminarCarta = async (id: number) => {
  const res = await api.delete(`/cartas/delete/${id}`);
  return res.data;
};

export const actualizarCarta = async (
  id: number,
  data: {
    nombre: string;
    categoria: string;
    rareza: string;
    estado: string;
    imagen: string;
  },
) => {
  const res = await api.put(`/cartas/update/${id}`, data);
  return res.data;
};
