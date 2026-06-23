import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: any, imagenPerfil?: string) {
    const { nombre, apellido, email, nombreUsuario, password, fechaNacimiento, descripcionBreve, perfil } = registerDto;

    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const existingUsername = await this.usersService.findByNombreUsuario(nombreUsuario);
    if (existingUsername) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fechaFormateada = this.validateAndFormatDate(fechaNacimiento);

    const user = await this.usersService.create({
      nombre,
      apellido,
      email,
      nombreUsuario,
      password: hashedPassword,
      fechaNacimiento: fechaFormateada,
      descripcionBreve: descripcionBreve || '',
      perfil: perfil || 'usuario',
      imagenPerfil: imagenPerfil || '',
    });

    return {
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      user: this.sanitizeUser(user),
    };
  }

  private validateAndFormatDate(dateStr: string): string {
    if (!dateStr) {
      throw new BadRequestException('La fecha de nacimiento es obligatoria');
    }

    let day: number, month: number, year: number;

    const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;

    if (ddmmyyyy.test(dateStr)) {
      const match = dateStr.match(ddmmyyyy)!;
      day = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      year = parseInt(match[3], 10);
    } else if (yyyymmdd.test(dateStr)) {
      const match = dateStr.match(yyyymmdd)!;
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
    } else {
      throw new BadRequestException('Formato de fecha inválido. Use DD/MM/YYYY');
    }

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      throw new BadRequestException('La fecha de nacimiento no es válida');
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) {
      throw new BadRequestException('La fecha de nacimiento no puede ser una fecha futura');
    }

    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    const yyyy = String(year);
    return `${dd}/${mm}/${yyyy}`;
  }

  private sanitizeUser(user: any) {
    const obj = user.toObject();
    const { password, ...userData } = obj;
    return userData;
  }
}
