import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  apellido!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true, unique: true })
  nombreUsuario!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  fechaNacimiento!: string;

  @Prop({ default: '' })
  descripcionBreve!: string;

  @Prop({ default: 'usuario' })
  perfil!: string;

  @Prop({ default: '' })
  imagenPerfil!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
