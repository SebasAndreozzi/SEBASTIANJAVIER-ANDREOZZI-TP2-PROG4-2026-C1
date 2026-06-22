import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './posts.schema';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async create(createPostDto: any): Promise<PostDocument> {
    const created = new this.postModel(createPostDto);
    return created.save();
  }

  async findAll(params: { sort?: string; order?: string; offset?: string; limit?: string; autor?: string }): Promise<PostDocument[]> {
    const filter: any = { activo: true };
    if (params.autor) {
      filter.autor = params.autor;
    }

    const offset = parseInt(params.offset || '0', 10);
    const limit = parseInt(params.limit || '10', 10);
    const sortDir = params.order === 'asc' ? 1 : -1;

    const pipeline: any[] = [
      { $match: filter },
      { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
    ];

    if (params.sort === 'likes') {
      pipeline.push({ $sort: { likesCount: sortDir } });
    } else {
      pipeline.push({ $sort: { createdAt: sortDir } });
    }

    pipeline.push({ $skip: offset }, { $limit: limit });

    const posts = await this.postModel.aggregate(pipeline).exec();

    return this.postModel.populate(posts, [
      { path: 'autor', select: 'nombre apellido nombreUsuario imagenPerfil' },
      { path: 'comentarios.usuario', select: 'nombre apellido nombreUsuario' },
    ]);
  }

  async findById(id: string): Promise<PostDocument | null> {
    return this.postModel
      .findById(id)
      .populate('autor', 'nombre apellido nombreUsuario imagenPerfil')
      .populate('comentarios.usuario', 'nombre apellido nombreUsuario')
      .exec();
  }

  async softDelete(postId: string, userId: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    if (post.autor.toString() !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
    }

    post.activo = false;
    return post.save();
  }

  async likePost(postId: string, userId: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    const userIdStr = userId.toString();
    const index = post.likes.indexOf(userIdStr);
    if (index === -1) {
      post.likes.push(userIdStr);
    }
    return post.save();
  }

  async unlikePost(postId: string, userId: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    const userIdStr = userId.toString();
    const index = post.likes.indexOf(userIdStr);
    if (index !== -1) {
      post.likes.splice(index, 1);
    }
    return post.save();
  }

  async addComment(postId: string, usuarioId: string, contenido: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    post.comentarios.push({ usuario: usuarioId, contenido, fecha: new Date() } as any);
    return post.save();
  }
}
