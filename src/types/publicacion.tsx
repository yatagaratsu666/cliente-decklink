import { BaseCarta } from "./baseCarta";
import { User } from "./usuario";

export interface Publicacion extends BaseCarta {
  id: number;
  modo: "carta" | "lote";

  precio?: number;
  id_usuario: number;

  usuario?: User;
}
