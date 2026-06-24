import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './posts.schema';
import { PostsGateway } from './posts.gateway';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly postsGateway: PostsGateway
  ) {}

  async create(createPostDto: any): Promise<PostDocument> {
    const created = new this.postModel(createPostDto);
    const saved = await created.save();
    const populated = await this.findById(saved.id);
    if (populated) {
      this.postsGateway.emitPostCreated(populated);
      return populated;
    }
    return saved;
  }

  async findAll(params: { sort?: string; order?: string; offset?: string; limit?: string; autor?: string }): Promise<PostDocument[]> {
    const filter: any = { activo: true };
    if (params.autor) {
      filter.autor = params.autor;
    }

    const offset = parseInt(params.offset || '0', 10) || 0;
    const limit = parseInt(params.limit || '5', 10) || 5;
    const sortDir = params.order === 'asc' ? 1 : -1;

    if (params.sort === 'likes') {
      const pipeline: any[] = [
        { $match: filter },
        { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
        { $sort: { likesCount: sortDir } },
        { $skip: offset },
        { $limit: limit },
      ];
      const posts = await this.postModel.aggregate(pipeline).exec();
      const ids = posts.map((p) => p._id);

      const populated = await this.postModel
        .find({ _id: { $in: ids } })
        .populate('autor', 'nombre apellido nombreUsuario imagenPerfil')
        .populate('comentarios.usuario', 'nombreUsuario')
        .exec();

      const map = new Map(populated.map((p) => [p._id.toString(), p]));
      return ids.map((id) => map.get(id.toString())).filter(Boolean) as PostDocument[];
    }

    return this.postModel
      .find(filter)
      .sort({ createdAt: sortDir })
      .skip(offset)
      .limit(limit)
      .populate('autor', 'nombre apellido nombreUsuario imagenPerfil')
      .populate('comentarios.usuario', 'nombreUsuario')
      .exec();
  }

  async findById(id: string): Promise<PostDocument | null> {
    return this.postModel
      .findById(id)
      .populate('autor', 'nombre apellido nombreUsuario imagenPerfil')
      .populate('comentarios.usuario', 'nombreUsuario')
      .exec();
  }

  async softDelete(postId: string, userId: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    if (post.autor.toString() !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
    }

    post.activo = false;
    const saved = await post.save();
    this.postsGateway.emitPostDeleted(postId);
    return saved;
  }

  async likePost(postId: string, userId: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    const userIdStr = userId.toString();
    const index = post.likes.indexOf(userIdStr);
    if (index === -1) {
      post.likes.push(userIdStr);
    }
    const saved = await post.save();
    const populated = await this.findById(postId);
    if (populated) {
      this.postsGateway.emitPostUpdated(populated);
      return populated;
    }
    return saved;
  }

  async unlikePost(postId: string, userId: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    const userIdStr = userId.toString();
    const index = post.likes.indexOf(userIdStr);
    if (index !== -1) {
      post.likes.splice(index, 1);
    }
    const saved = await post.save();
    const populated = await this.findById(postId);
    if (populated) {
      this.postsGateway.emitPostUpdated(populated);
      return populated;
    }
    return saved;
  }

}
