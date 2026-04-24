import { api } from "./api";

export const getMensajes = async (chatId: number) => {
  const res = await api.get(`/chat/${chatId}/mensajes`);
  return res.data;
};
