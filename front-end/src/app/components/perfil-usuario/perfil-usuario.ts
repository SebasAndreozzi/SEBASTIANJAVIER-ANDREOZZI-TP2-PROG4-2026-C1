import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Header } from '../header/header';
import { PostCard } from '../post-card/post-card';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { PostsService } from '../../services/posts.service';
import { SocketService } from '../../services/socket.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiImagePipe } from '../../pipes/api-image.pipe';
import { Post } from '../../interfaces/post';

@Component({
  selector: 'app-perfil-usuario',
  imports: [ReactiveFormsModule, Header, PostCard, ApiImagePipe],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css',
})
export class PerfilUsuario implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private postsService = inject(PostsService);
  private socketService = inject(SocketService);

  editing = signal(false);
  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  userPosts = signal<Post[]>([]);

  currentUser = this.authService.currentUser;

  profileForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required]],
    descripcionBreve: [''],
  });

  ngOnInit() {
    const user = this.currentUser();
    if (user) {
      this.patchForm(user);
      this.loadUserPosts(user._id);
    }
    this.socketService.on('postUpdated', (post: Post) => {
      this.userPosts.update((posts) =>
        posts.map((p) => (p._id === post._id ? post : p)),
      );
    });
    this.socketService.on('postDeleted', (postId: string) => {
      this.userPosts.update((posts) => posts.filter((p) => p._id !== postId));
    });
  }

  ngOnDestroy() {
    this.socketService.off('postUpdated');
    this.socketService.off('postDeleted');
  }

  private patchForm(user: any) {
    this.profileForm.patchValue({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      nombreUsuario: user.nombreUsuario,
      descripcionBreve: user.descripcionBreve,
    });
  }

  private loadUserPosts(userId: string) {
    this.postsService.getAll({ autor: userId, limit: 3, sort: 'createdAt' }).subscribe({
      next: ({ data }) => this.userPosts.set(data),
    });
  }

  onLike(postId: string) {
    const post = this.userPosts().find((p) => p._id === postId);
    if (!post) return;

    const user = this.currentUser();
    const isLiked = user ? post.likes.includes(user._id) : false;

    (isLiked ? this.postsService.unlikePost(postId) : this.postsService.likePost(postId)).subscribe({
      next: (updatedPost) => {
        this.userPosts.update((posts) =>
          posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
        );
      },
    });
  }

  onDelete(postId: string) {
    this.postsService.deletePost(postId).subscribe({
      next: () => {
        this.userPosts.update((posts) => posts.filter((p) => p._id !== postId));
      },
    });
  }

  toggleEdit() {
    this.editing.update((v) => !v);
    if (!this.editing()) {
      const user = this.currentUser();
      if (user) this.patchForm(user);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.loading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const user = this.currentUser();
    if (!user) return;

    this.usersService.update(user._id, this.profileForm.value as any).subscribe({
      next: (updatedUser) => {
        this.loading.set(false);
        this.successMessage.set('Perfil actualizado correctamente');
        this.authService.currentUser.set(updatedUser);
        this.editing.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al actualizar perfil');
      },
    });
  }
}
