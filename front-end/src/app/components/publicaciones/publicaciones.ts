import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Header } from '../header/header';
import { PostCard } from '../post-card/post-card';
import { PostsService } from '../../services/posts.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../interfaces/post';

@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, Header, PostCard],
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
  currentPage = signal(0);
  totalPages = signal(0);
  sortBy = signal<'createdAt' | 'likes'>('createdAt');

  pageSize = 10;

  postForm = this.fb.group({
    titulo: ['', [Validators.required]],
    mensaje: ['', [Validators.required]],
  });

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading.set(true);
    this.postsService.getAll({
      sort: this.sortBy(),
      offset: this.currentPage() * this.pageSize,
      limit: this.pageSize,
    }).subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.totalPages.set(posts.length < this.pageSize ? this.currentPage() + 1 : this.currentPage() + 2);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar publicaciones');
        this.loading.set(false);
      },
    });
  }

  setSort(sort: 'createdAt' | 'likes') {
    this.sortBy.set(sort);
    this.currentPage.set(0);
    this.loadPosts();
  }

  nextPage() {
    this.currentPage.update((p) => p + 1);
    this.loadPosts();
  }

  prevPage() {
    this.currentPage.update((p) => Math.max(0, p - 1));
    this.loadPosts();
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
        this.currentPage.set(0);
        this.loadPosts();
      },
      error: () => {
        this.createLoading.set(false);
        this.errorMessage.set('Error al crear la publicación');
      },
    });
  }

  onLike(postId: string) {
    const post = this.posts().find((p) => p._id === postId);
    if (!post) return;

    const user = this.authService.currentUser();
    const isLiked = user ? post.likes.includes(user._id) : false;

    (isLiked ? this.postsService.unlikePost(postId) : this.postsService.likePost(postId)).subscribe({
      next: (updatedPost) => {
        this.posts.update((posts) =>
          posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
        );
      },
    });
  }

  onComment(data: { postId: string; text: string }) {
    this.postsService.addComment(data.postId, data.text).subscribe({
      next: (updatedPost) => {
        this.posts.update((posts) =>
          posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
        );
      },
    });
  }

  onDelete(postId: string) {
    this.postsService.deletePost(postId).subscribe({
      next: () => {
        this.posts.update((posts) => posts.filter((p) => p._id !== postId));
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error al eliminar publicación');
      },
    });
  }
}
