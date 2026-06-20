import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Header } from '../header/header';
import { PostsService } from '../../services/posts.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../interfaces/post';

@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, DatePipe, Header],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  private fb = inject(FormBuilder);
  private postsService = inject(PostsService);
  protected authService = inject(AuthService);

  posts = signal<Post[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  showCreateForm = signal(false);
  createLoading = signal(false);
  selectedFile = signal<File | null>(null);
  commentText = signal<{ [postId: string]: string }>({});

  postForm = this.fb.group({
    titulo: ['', [Validators.required]],
    mensaje: ['', [Validators.required]],
  });

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading.set(true);
    this.postsService.getAll().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar publicaciones');
        this.loading.set(false);
      },
    });
  }

  toggleCreateForm() {
    this.showCreateForm.update((v) => !v);
    if (!this.showCreateForm()) {
      this.postForm.reset();
      this.selectedFile.set(null);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onCreatePost() {
    if (this.postForm.invalid) return;

    this.createLoading.set(true);
    const formData = new FormData();
    formData.append('titulo', this.postForm.value.titulo!);
    formData.append('mensaje', this.postForm.value.mensaje!);

    const file = this.selectedFile();
    if (file) {
      formData.append('imagen', file);
    }

    this.postsService.create(formData).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.showCreateForm.set(false);
        this.postForm.reset();
        this.selectedFile.set(null);
        this.loadPosts();
      },
      error: () => {
        this.createLoading.set(false);
        this.errorMessage.set('Error al crear la publicación');
      },
    });
  }

  toggleLike(post: Post) {
    this.postsService.likePost(post._id).subscribe({
      next: (updatedPost) => {
        this.posts.update((posts) =>
          posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
        );
      },
    });
  }

  sendComment(postId: string) {
    const text = this.commentText()[postId]?.trim();
    if (!text) return;

    this.postsService.addComment(postId, text).subscribe({
      next: (updatedPost) => {
        this.posts.update((posts) =>
          posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
        );
        this.commentText.update((map) => ({ ...map, [postId]: '' }));
      },
    });
  }

  updateCommentText(postId: string, value: string) {
    this.commentText.update((map) => ({ ...map, [postId]: value }));
  }

  isLiked(post: Post): boolean {
    const user = this.authService.currentUser();
    return user ? post.likes.includes(user._id) : false;
  }
}
