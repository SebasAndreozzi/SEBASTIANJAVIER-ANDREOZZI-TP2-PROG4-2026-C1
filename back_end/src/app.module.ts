import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath:'.env' 
    }),
    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),

      inject: [ConfigService],
    }),
    
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    PostModule,
  ],
})
export class AppModule {}
