import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, Comentario } from '../interfaces/post';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/posts';

  getAll(params?: { sort?: string; order?: string; offset?: number; limit?: number; autor?: string }): Observable<{ data: Post[], total: number }> {
    let queryParams: any = {};
    if (params?.sort) queryParams['sort'] = params.sort;
    if (params?.order) queryParams['order'] = params.order;
    if (params?.offset !== undefined) queryParams['offset'] = params.offset;
    if (params?.limit !== undefined) queryParams['limit'] = params.limit;
    if (params?.autor) queryParams['autor'] = params.autor;
    return this.http.get<{ data: Post[], total: number }>(this.apiUrl, { params: queryParams });
  }

  create(formData: FormData): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, formData);
  }

  deletePost(id: string): Observable<Post> {
    return this.http.delete<Post>(`${this.apiUrl}/${id}`);
  }

  likePost(id: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${id}/like`, {});
  }

  unlikePost(id: string): Observable<Post> {
    return this.http.delete<Post>(`${this.apiUrl}/${id}/like`);
  }

  getPost(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  addComment(postId: string, contenido: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${postId}/comments`, { contenido });
  }

  editComment(postId: string, commentId: string, contenido: string): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${postId}/comments/${commentId}`, { contenido });
  }

  getComments(postId: string, offset: number, limit: number): Observable<{ data: Comentario[]; total: number }> {
    return this.http.get<{ data: Comentario[]; total: number }>(
      `${this.apiUrl}/${postId}/comments`,
      { params: { offset: offset.toString(), limit: limit.toString() } },
    );
  }

}
