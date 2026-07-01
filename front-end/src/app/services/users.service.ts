import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/users';

  update(id: string, data: FormData): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, data);
  }

  findAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  create(userData: any): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  disable(id: string): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${id}`);
  }

  enable(id: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${id}/enable`, {});
  }
}
