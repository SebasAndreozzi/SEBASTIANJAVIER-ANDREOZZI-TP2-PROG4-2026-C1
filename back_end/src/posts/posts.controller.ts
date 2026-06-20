import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.postsService.create({ ...body, autor: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.postsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async like(@Param('id') id: string, @Req() req: any) {
    return this.postsService.likePost(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comentarios')
  async addComment(@Param('id') id: string, @Body() body: { contenido: string }, @Req() req: any) {
    return this.postsService.addComment(id, req.user.id, body.contenido);
  }
}
