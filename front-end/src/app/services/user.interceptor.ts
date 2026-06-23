import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const userInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const user = auth.currentUser();
  if (user?._id) {
    const cloned = req.clone({
      setHeaders: { 'X-User-Id': user._id },
    });
    return next(cloned);
  }
  return next(req);
};
