import { BaseCarta } from "./baseCarta";
import { User } from "./usuario";

export interface Publicacion extends BaseCarta {
  id_publicacion: number;
  modo: "carta" | "lote";

  fecha_publicacion: string;

  precio?: number;
  id_usuario: number;

  usuario?: User;
}
