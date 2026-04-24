import { BaseCarta } from "./baseCarta";
import { User } from "./usuario";

export interface Publicacion extends BaseCarta {
  id_publicacion: number;
  modo: "carta" | "lote";

  fecha_creacion: string;

  precio?: number;
  id_usuario: number;

  estado?: string;

  usuario?: User;
}
