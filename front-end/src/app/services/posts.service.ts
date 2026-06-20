import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../interfaces/post';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly apiUrl = 'http://localhost:3000/posts';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  getById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  create(formData: FormData): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, formData);
  }

  likePost(id: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${id}/like`, {});
  }

  addComment(id: string, contenido: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${id}/comentarios`, { contenido });
  }
}
