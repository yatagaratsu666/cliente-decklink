export interface Message {
  id?: number | string;
  message?: string;
  userId: number;

  tipo?: string;

  propuestaUser?: number;

  tipoContenido?: "carta" | "lote";

  carta?: {
    nombre: string;
    juego?: string;
    edicion?: string;
    numero?: string;
    rareza?: string;
    imagen_url?: string;
    descripcion?: string;
    tipoCarta?: string[];
  };

  lote?: {
    nombre: string;
    cartas: {
      imagen_url: string;
      nombre: string;
    }[];
  };
}
