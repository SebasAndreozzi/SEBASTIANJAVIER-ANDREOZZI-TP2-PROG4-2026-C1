import { Controller, Get, Post, Body, Param, UseGuards, Req, Delete, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PostsService } from './posts.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
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
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File | undefined, @Req() req: any) {
    const imagen = file ? `/uploads/${file.filename}` : undefined;
    return this.postsService.create({ ...body, imagen, autor: req.user.sub });
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('autor') autor?: string,
  ) {
    return this.postsService.findAll({ sort, order, offset, limit, autor });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.postsService.softDelete(id, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post(':id/like')
  async like(@Param('id') id: string, @Req() req: any) {
    return this.postsService.likePost(id, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/like')
  async unlike(@Param('id') id: string, @Req() req: any) {
    return this.postsService.unlikePost(id, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post(':id/comentarios')
  async addComment(@Param('id') id: string, @Body() body: { contenido: string }, @Req() req: any) {
    return this.postsService.addComment(id, req.user.sub, body.contenido);
  }
}
