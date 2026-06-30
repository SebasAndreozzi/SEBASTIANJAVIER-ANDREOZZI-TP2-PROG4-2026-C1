import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../services/posts.service';
import { AuthService } from '../../services/auth.service';
import { Header } from '../header/header';
import { Post, Comentario } from '../../interfaces/post';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-publicacion',
  imports: [Header, DatePipe, FormsModule],
  templateUrl: './detalle-publicacion.html',
  styleUrl: './detalle-publicacion.css',
})
export class DetallePublicacion implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postsService = inject(PostsService);
  protected authService = inject(AuthService);

  post = signal<Post | null>(null);
  comments = signal<Comentario[]>([]);
  totalComments = signal(0);
  loading = signal(true);
  commentLoading = signal(false);
  commentsOffset = signal(0);
  commentsPageSize = 3;
  hasMoreComments = signal(false);
  newCommentText = signal('');
  editingCommentId = signal<string | null>(null);
  editCommentText = signal('');

  private postId: string | null = null;

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id');
    if (this.postId) {
      this.loadPost();
    } else {
      this.router.navigate(['/publicaciones']);
    }
  }

  private loadPost() {
    if (!this.postId) return;
    this.loading.set(true);
    this.postsService.getPost(this.postId).subscribe({
      next: (post) => {
        this.post.set(post);
        this.loading.set(false);
        this.loadComments();
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/publicaciones']);
      },
    });
  }

  loadComments() {
    if (!this.postId) return;
    this.commentLoading.set(true);
    this.postsService.getComments(this.postId, this.commentsOffset(), this.commentsPageSize).subscribe({
      next: ({ data, total }) => {
        this.comments.update((prev) => [...prev, ...data]);
        this.totalComments.set(total);
        this.commentsOffset.update((off) => off + this.commentsPageSize);
        this.hasMoreComments.set(this.comments().length < total);
        this.commentLoading.set(false);
      },
      error: () => {
        this.commentLoading.set(false);
      },
    });
  }

  loadMoreComments() {
    this.loadComments();
  }

  submitComment() {
    if (!this.postId || !this.newCommentText().trim()) return;
    this.postsService.addComment(this.postId, this.newCommentText().trim()).subscribe({
      next: () => {
        this.newCommentText.set('');
        this.resetComments();
      },
    });
  }

  startEditComment(comment: Comentario) {
    this.editingCommentId.set(comment._id);
    this.editCommentText.set(comment.contenido);
  }

  cancelEditComment() {
    this.editingCommentId.set(null);
    this.editCommentText.set('');
  }

  saveEditComment(commentId: string) {
    if (!this.postId || !this.editCommentText().trim()) return;
    this.postsService.editComment(this.postId, commentId, this.editCommentText().trim()).subscribe({
      next: () => {
        this.editingCommentId.set(null);
        this.editCommentText.set('');
        this.resetComments();
      },
    });
  }

  private resetComments() {
    this.comments.set([]);
    this.commentsOffset.set(0);
    this.loadComments();
  }

  goBack() {
    this.router.navigate(['/publicaciones']);
  }

  onDelete(postId: string) {
    Swal.fire({
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.postsService.deletePost(postId).subscribe({
          next: () => this.router.navigate(['/publicaciones']),
        });
      }
    });
  }

  onLike() {
    const p = this.post();
    if (!p) return;
    const user = this.authService.currentUser();
    const isLiked = user ? p.likes.includes(user._id) : false;
    (isLiked ? this.postsService.unlikePost(p._id) : this.postsService.likePost(p._id)).subscribe({
      next: (updatedPost) => {
        this.post.set(updatedPost);
      },
    });
  }

  isOwnPost(): boolean {
    const p = this.post();
    const user = this.authService.currentUser();
    return p && user ? p.autor._id === user._id : false;
  }

  isLiked(): boolean {
    const p = this.post();
    const user = this.authService.currentUser();
    return p && user ? p.likes.includes(user._id) : false;
  }

  isOwnComment(comment: Comentario): boolean {
    const user = this.authService.currentUser();
    return user ? comment.usuario === user._id : false;
  }
}
