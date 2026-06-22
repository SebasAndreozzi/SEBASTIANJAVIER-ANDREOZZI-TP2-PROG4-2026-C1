import { Component, input, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiImagePipe } from '../../pipes/api-image.pipe';
import { Post } from '../../interfaces/post';

@Component({
  selector: 'app-post-card',
  imports: [DatePipe, FormsModule, ApiImagePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  protected authService = inject(AuthService);

  post = input.required<Post>();
  liked = output<string>();
  commentSent = output<{ postId: string; text: string }>();
  deleted = output<string>();
  commentText = '';

  onLike() {
    this.liked.emit(this.post()._id);
  }

  onDelete() {
    if (confirm('¿Eliminar esta publicación?')) {
      this.deleted.emit(this.post()._id);
    }
  }

  onSendComment() {
    const text = this.commentText.trim();
    if (!text) return;
    this.commentSent.emit({ postId: this.post()._id, text });
    this.commentText = '';
  }

  isOwnPost(): boolean {
    const user = this.authService.currentUser();
    return user ? this.post().autor._id === user._id : false;
  }

  isLiked(): boolean {
    const user = this.authService.currentUser();
    return user ? this.post().likes.includes(user._id) : false;
  }
}
