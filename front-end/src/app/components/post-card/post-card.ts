import { Component, input, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { ApiImagePipe } from '../../pipes/api-image.pipe';
import { Post } from '../../interfaces/post';

@Component({
  selector: 'app-post-card',
  imports: [DatePipe, ApiImagePipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  protected authService = inject(AuthService);

  post = input.required<Post>();
  liked = output<string>();
  deleted = output<string>();

  onLike() {
    this.liked.emit(this.post()._id);
  }

  async onDelete() {
    const result = await Swal.fire({
      title: '¿Eliminar publicación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      background: '#1a0a2e',
      color: '#f0e6d3',
      iconColor: '#ffd700',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      this.deleted.emit(this.post()._id);
    }
  }

  safeComments() {
    const c = this.post()?.comentarios;
    if (!c || !Array.isArray(c)) return [];
    return c;
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
