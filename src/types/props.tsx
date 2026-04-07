import { Carta } from "./carta";

export interface Props {
  visible: boolean;
  carta: Carta | null;
  onClose: () => void;
  onEliminar?: (id: number) => void;
  modo?: "inventario" | "lote";
}
