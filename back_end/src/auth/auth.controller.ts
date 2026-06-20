import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
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
    const imagenPerfil = file ? `/uploads/${file.filename}` : undefined;
    return this.authService.register(body, imagenPerfil);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }
}
