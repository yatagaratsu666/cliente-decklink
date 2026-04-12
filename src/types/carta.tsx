import { BaseCarta } from "./baseCarta";

export interface Carta extends BaseCarta {
  id_carta: number;
}

export interface CartaMongo extends BaseCarta {
  id_carta: string;
}
