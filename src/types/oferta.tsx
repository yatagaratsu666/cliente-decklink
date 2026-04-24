export interface Oferta {
  id_oferta: number;
  id_usuario: number;
  estado: "activa" | "aceptada" | "rechazada";
  fecha_creacion: string;

  usuario: {
    id_usuario: number;
    nombre_usuario: string;
    foto_perfil: string;
    reputacion: number;
  };

  carta_ofrecida: {
    nombre: string;
    imagen: string;
  };

  lote?: {
    nombre: string;
    cartas: {
      imagen_url: string;
      nombre: string;
      juego?: string;
      edicion?: string;
      numero?: string;
      rareza?: string;
    }[];
  };

  carta_deseada: {
    id_carta: string;
    nombre: string;
    juego: string;
    edicion: string;
    numero: string;
    rareza: string;
    imagen_url: string;
    descripcion: string;
    tipo: string[];
  };
}
