import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: memoryStorage(),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.match(/^image\//)) {
          callback(new BadRequestException('Solo se permiten imágenes'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async register(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imagenPerfil: string | undefined;
    if (file) {
      imagenPerfil = await this.cloudinaryService.uploadImage(file.buffer, 'profile-pictures');
    }
    return this.authService.register(body, imagenPerfil);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }
}
