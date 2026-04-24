import { api } from "./api";

export const crearPropuesta = (data: any) => {
  return api.post("/ofertas/propuesta", data);
};

export const getPropuestas = async (): Promise<any[] | null> => {
  const res = await api.get("/ofertas/propuestas");
  if (!res) return null;
  return res.data;
};

export const aceptarPropuesta = async (
  id_propuesta: number,
): Promise<any | null> => {
  const res = await api.post(`/ofertas/propuestas/aceptar/${id_propuesta}`);
  if (!res) return null;
  return res.data;
};

export const rechazarPropuesta = async (
  id_propuesta: number,
): Promise<any | null> => {
  const res = await api.post(`/ofertas/propuestas/rechazar/${id_propuesta}`);
  if (!res) return null;
  return res.data;
};

export const solicitarConfirmacion = async (
  id_propuesta: number,
): Promise<any | null> => {
  const res = await api.post("/ofertas/propuestas/solicitar-confirmacion", {
    id_propuesta,
  });

  if (!res) return null;
  return res.data;
};
