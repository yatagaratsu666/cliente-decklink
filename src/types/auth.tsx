export interface User {
  id_usuario?: number;
  email: string;
  nombre_usuario?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user?: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
}
