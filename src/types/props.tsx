import { Carta } from "./carta";
import { Publicacion } from "./publicacion";

export interface Props {
  visible: boolean;
  carta: Carta | Publicacion | null;

  onClose: () => void;

  onEliminar?: (id: number) => void | Promise<void>;

  modo?: "inventario" | "lote" | "busqueda" | "publicado";

  onPublicar?: (id: string | number) => void;

  onAgregar?: (id: string | number) => void;
  onQuitar?: (id: string | number) => void;

  cantidad?: number;
}
