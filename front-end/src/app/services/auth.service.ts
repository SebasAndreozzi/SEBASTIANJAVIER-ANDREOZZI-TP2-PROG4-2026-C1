import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse, User } from '../interfaces/user';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl + '/auth';
  private readonly userKey = 'auth_user';

  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    if (!isPlatformBrowser(this.platformId)) return;
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch {
        this.clearAuth();
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => this.setAuth(res)),
    );
  }

  register(formData: FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, formData).pipe(
      tap((res) => this.setAuth(res)),
    );
  }

  private setAuth(res: AuthResponse) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userKey, JSON.stringify(res.user));
    }
    this.currentUser.set(res.user);
    this.isAuthenticated.set(true);
  }

  logout() {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  private clearAuth() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.userKey);
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

}