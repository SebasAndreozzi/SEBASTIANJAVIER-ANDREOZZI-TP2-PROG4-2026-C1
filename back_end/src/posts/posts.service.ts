import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(): Promise<PostDocument[]> {
    return this.postModel.find().populate('autor', 'nombre apellido nombreUsuario imagenPerfil').sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<PostDocument | null> {
    return this.postModel.findById(id).populate('autor', 'nombre apellido nombreUsuario imagenPerfil').populate('comentarios.usuario', 'nombre apellido nombreUsuario').exec();
  }

  async likePost(postId: string, userId: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    const userIdStr = userId.toString();
    const index = post.likes.indexOf(userIdStr);
    if (index === -1) {
      post.likes.push(userIdStr);
    } else {
      post.likes.splice(index, 1);
    }
    return post.save();
  }

  async addComment(postId: string, usuarioId: string, contenido: string): Promise<PostDocument | null> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    post.comentarios.push({ usuario: usuarioId, contenido, fecha: new Date() });
    return post.save();
  }
}
