import { Controller, Get, Post, Param, UseGuards, Patch, Body, NotFoundException, BadRequestException, Req, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(AuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: memoryStorage(),
      fileFilter: (_req: any, file: any, callback: any) => {
        if (!file.mimetype.match(/^image\//)) {
          callback(new BadRequestException('Solo se permiten imágenes'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async updateUser(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const updateData = { ...body };
    if (file) {
      updateData.imagenPerfil = await this.cloudinaryService.uploadImage(file.buffer, 'profile-pictures');
    }
    const user = await this.usersService.update(id, updateData);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const { password, ...userData } = user.toObject();
    return userData;
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post()
  async createUser(@Body() body: any) {
    const { nombre, apellido, email, nombreUsuario, password, fechaNacimiento, descripcionBreve, perfil } = body;

    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const existingUsername = await this.usersService.findByNombreUsuario(nombreUsuario);
    if (existingUsername) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      nombre,
      apellido,
      email,
      nombreUsuario,
      password: hashedPassword,
      fechaNacimiento,
      descripcionBreve: descripcionBreve || '',
      perfil: perfil || 'usuario',
    });

    const { password: _, ...userData } = user.toObject();
    return userData;
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  async disableUser(@Param('id') id: string) {
    const user = await this.usersService.disable(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post(':id/enable')
  async enableUser(@Param('id') id: string) {
    const user = await this.usersService.enable(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
}
