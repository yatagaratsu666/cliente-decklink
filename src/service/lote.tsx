import { api } from "./api";

export const getLotes = async () => {
  const res = await api.get("/lotes/list");
  return res.data;
};

export const crearLote = async (nombre: string) => {
  const res = await api.post("/lotes/create", { nombre });
  return res.data;
};

export const eliminarLote = async (id: number) => {
  const res = await api.delete(`/lotes/delete/${id}`);
  return res.data;
};

export const actualizarLote = async (id: number, nombre: string) => {
  const res = await api.put(`/lotes/update/${id}`, { nombre });
  return res.data;
};

export const agregarCartaLote = async (id_lote: number, id_carta: number) => {
  const res = await api.post("/lotes/agregar", { id_lote, id_carta });
  return res.data;
};

export const quitarCartaLote = async (id_lote: number, id_carta: number) => {
  const res = await api.post("/lotes/quitar", { id_lote, id_carta });
  return res.data;
};

export const getCartasLote = async (id: number) => {
  const res = await api.get(`/lotes/${id}/cartas`);
  return res.data;
};
