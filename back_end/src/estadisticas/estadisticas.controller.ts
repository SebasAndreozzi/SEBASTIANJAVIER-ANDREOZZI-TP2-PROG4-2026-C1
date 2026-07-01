import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../posts/posts.schema';
import { User, UserDocument } from '../users/users.schema';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Get('posts-por-usuario')
  async postsPorUsuario(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    try {
      const filter: any = { activo: true };
      if (desde || hasta) {
        filter.createdAt = {};
        if (desde) filter.createdAt.$gte = new Date(desde);
        if (hasta) filter.createdAt.$lte = new Date(hasta);
      }

      const grouped = await this.postModel.aggregate([
        { $match: filter },
        { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
        { $sort: { cantidad: -1 } },
      ]).exec();

      const userIds = grouped.map(g => g._id);
      const users = await this.userModel.find({ _id: { $in: userIds } }).select('nombreUsuario').lean().exec();
      const userMap = new Map(users.map(u => [u._id.toString(), u.nombreUsuario]));

      return grouped.map(g => ({
        usuario: userMap.get(g._id.toString()) || 'Usuario eliminado',
        cantidad: g.cantidad,
      }));
    } catch (error) {
      throw new BadRequestException('Error al obtener estadísticas de publicaciones por usuario');
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('comentarios-en-periodo')
  async comentariosEnPeriodo(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    try {
      const matchComentarios: any = {};
      if (desde) matchComentarios['comentarios.fecha'] = { $gte: new Date(desde) };
      if (hasta) {
        if (!matchComentarios['comentarios.fecha']) matchComentarios['comentarios.fecha'] = {};
        matchComentarios['comentarios.fecha'].$lte = new Date(hasta);
      }

      const pipeline: any[] = [
        { $match: { activo: true } },
        { $unwind: '$comentarios' },
      ];

      if (desde || hasta) {
        pipeline.push({ $match: matchComentarios });
      }

      pipeline.push(
        { $group: { _id: '$comentarios.usuario', cantidad: { $sum: 1 } } },
        { $sort: { cantidad: -1 } },
      );

      const grouped = await this.postModel.aggregate(pipeline).exec();

      const userIds = grouped.map(g => g._id);
      const users = await this.userModel.find({ _id: { $in: userIds } }).select('nombreUsuario').lean().exec();
      const userMap = new Map(users.map(u => [u._id.toString(), u.nombreUsuario]));

      return grouped.map(g => ({
        usuario: userMap.get(g._id.toString()) || 'Usuario eliminado',
        cantidad: g.cantidad,
      }));
    } catch (error) {
      throw new BadRequestException('Error al obtener estadísticas de comentarios por usuario');
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('comentarios-por-publicacion')
  async comentariosPorPublicacion(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const filter: any = { activo: true };
    if (desde || hasta) {
      filter.createdAt = {};
      if (desde) filter.createdAt.$gte = new Date(desde);
      if (hasta) filter.createdAt.$lte = new Date(hasta);
    }

    const result = await this.postModel.aggregate([
      { $match: filter },
      {
        $project: {
          titulo: 1,
          cantidadComentarios: { $size: { $ifNull: ['$comentarios', []] } },
        },
      },
      { $sort: { cantidadComentarios: -1 } },
    ]).exec();

    return result;
  }
}
