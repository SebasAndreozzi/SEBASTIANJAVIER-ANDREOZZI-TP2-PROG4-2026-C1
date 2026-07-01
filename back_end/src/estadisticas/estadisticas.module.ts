import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '../posts/posts.schema';
import { User, UserSchema } from '../users/users.schema';
import { EstadisticasController } from './estadisticas.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }, { name: User.name, schema: UserSchema }])],
  controllers: [EstadisticasController],
})
export class EstadisticasModule {}
