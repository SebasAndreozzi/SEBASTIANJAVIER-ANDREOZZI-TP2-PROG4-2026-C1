export interface PostsPorUsuario {
  usuario: string;
  cantidad: number;
}

export interface ComentariosEnPeriodo {
  usuario: string;
  cantidad: number;
}

export interface ComentariosPorPublicacion {
  _id: string;
  titulo: string;
  cantidadComentarios: number;
}
