import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../interfaces/post';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/posts';

  getAll(params?: { sort?: string; order?: string; offset?: number; limit?: number; autor?: string }): Observable<Post[]> {
    let queryParams: any = {};
    if (params?.sort) queryParams['sort'] = params.sort;
    if (params?.order) queryParams['order'] = params.order;
    if (params?.offset !== undefined) queryParams['offset'] = params.offset;
    if (params?.limit !== undefined) queryParams['limit'] = params.limit;
    if (params?.autor) queryParams['autor'] = params.autor;
    return this.http.get<Post[]>(this.apiUrl, { params: queryParams });
  }

  getById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
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

  addComment(id: string, contenido: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${id}/comentarios`, { contenido });
  }
}
