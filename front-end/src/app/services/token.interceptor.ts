import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  let token: string | null = null;
  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('auth_token');
  }
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && isPlatformBrowser(platformId)) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          router.navigate(['/login']);
        }
        return throwError(() => err);
      }),
    );
  }
  return next(req);
};
