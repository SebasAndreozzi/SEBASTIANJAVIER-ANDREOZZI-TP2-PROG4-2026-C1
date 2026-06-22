import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  },
})
export class PostsGateway {
  @WebSocketServer()
  server: Server;

  emitPostCreated(post: any) {
    this.server.emit('postCreated', post);
  }

  emitPostUpdated(post: any) {
    this.server.emit('postUpdated', post);
  }

  emitPostDeleted(postId: string) {
    this.server.emit('postDeleted', postId);
  }
}
