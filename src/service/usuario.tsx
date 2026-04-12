import { User } from "../types/usuario";
import { api } from "./api";

export const getProfile = async (): Promise<User> => {
  const res = await api.get<User>("/auth/me");
  return res.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const res = await api.get<User>(`/auth/profile/${id}`);
  return res.data;
};
