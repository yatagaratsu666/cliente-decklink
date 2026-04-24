import { api } from "./api";

export const getLotes = async () => {
  try {
    const res = await api.get("/lotes/list");

    if (!res) return [];

    return res.data || [];
  } catch (error) {
    return [];
  }
};

export const crearLote = async (nombre: string): Promise<any | null> => {
  const res = await api.post("/lotes/create", { nombre });
  if (!res) return null;
  return res.data;
};

export const eliminarLote = async (id: number): Promise<any | null> => {
  const res = await api.delete(`/lotes/delete/${id}`);
  if (!res) return null;
  return res.data;
};

export const actualizarLote = async (
  id: number,
  nombre: string,
): Promise<any | null> => {
  const res = await api.put(`/lotes/update/${id}`, { nombre });
  if (!res) return null;
  return res.data;
};

export const agregarCartaLote = async (
  id_lote: number,
  id_carta: number,
): Promise<any | null> => {
  const res = await api.post("/lotes/agregar", { id_lote, id_carta });
  if (!res) return null;
  return res.data;
};

export const quitarCartaLote = async (
  id_lote: number,
  id_carta: number,
): Promise<any | null> => {
  const res = await api.post("/lotes/quitar", { id_lote, id_carta });
  if (!res) return null;
  return res.data;
};

export const getCartasLote = async (id: number): Promise<any | null> => {
  const res = await api.get(`/lotes/${id}/cartas`);
  if (!res) return null;
  return res.data;
};

export const getLotesPublicados = async (): Promise<any | null> => {
  const res = await api.get("/lotes/publicados");
  if (!res) return null;
  return res.data;
};

export const publicarLote = async (
  id: number,
  precio: number,
): Promise<any | null> => {
  const res = await api.put(`/lotes/publicar/${id}`, { precio });
  if (!res) return null;
  return res.data;
};

export const getLotePublicadoDetalle = async (
  id_publicacion: number,
): Promise<any | null> => {
  try {
    const res = await api.get(`/lotes/lote-publicado/${id_publicacion}`);
    if (!res) return null;
    return res.data;
  } catch (error) {
    console.log("Error getLotePublicadoDetalle:", error);
    throw error;
  }
};
