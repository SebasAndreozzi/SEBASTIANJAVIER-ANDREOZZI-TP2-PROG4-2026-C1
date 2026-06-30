export interface Comentario {
  _id: string;
  usuario: string;
  nombreUsuario: string;
  contenido: string;
  modificado?: boolean;
  fecha: string;
}

export interface Post {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen: string;
  autor: {
    _id: string;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    imagenPerfil: string;
  };
  likes: string[];
  comentarios: Comentario[];
  createdAt: string;
}
