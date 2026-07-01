export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcionBreve: string;
  perfil: string;
  imagenPerfil: string;
  activo?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
