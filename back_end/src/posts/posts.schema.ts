import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ default: '' })
  imagen: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ default: [] })
  likes: string[];

  @Prop({
    type: [{ usuario: { type: Types.ObjectId, ref: 'User' }, contenido: String, fecha: Date }],
    default: [],
  })
  comentarios: { usuario: Types.ObjectId; contenido: string; fecha: Date }[];

  @Prop({ default: true })
  activo: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
