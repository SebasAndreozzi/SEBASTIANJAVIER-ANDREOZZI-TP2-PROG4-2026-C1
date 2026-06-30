import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  titulo!: string;

  @Prop({ required: true })
  mensaje!: string;

  @Prop({ default: '' })
  imagen!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor!: Types.ObjectId;

  @Prop({ default: [] })
  likes!: string[];

  @Prop({
    type: [{
      usuario: { type: Types.ObjectId, ref: 'User' },
      contenido: String,
      modificado: { type: Boolean, default: false },
      fecha: { type: Date, default: Date.now },
    }],
    default: [],
  })
  comentarios!: {
    _id: Types.ObjectId;
    usuario: Types.ObjectId;
    contenido: string;
    modificado: boolean;
    fecha: Date;
  }[];

  @Prop({ default: true })
  activo!: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    if (Array.isArray(ret.comentarios)) {
      ret.comentarios = ret.comentarios.map((c: any) => ({
        _id: c._id,
        contenido: c.contenido,
        modificado: c.modificado ?? false,
        fecha: c.fecha,
        usuario: c.usuario?._id?.toString() ?? c.usuario?.toString?.() ?? c.usuario,
        nombreUsuario: c.usuario?.nombreUsuario ?? 'Usuario',
      }));
    }
    return ret;
  },
});
