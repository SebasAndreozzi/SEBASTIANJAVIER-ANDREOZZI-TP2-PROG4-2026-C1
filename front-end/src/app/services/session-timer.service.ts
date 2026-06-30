import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class SessionTimerService implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  private timer: ReturnType<typeof setTimeout> | null = null;

  start() {
    this.stop();
    this.timer = setTimeout(() => this.showExtensionModal(), 10 * 60 * 1000);
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private showExtensionModal() {
    Swal.fire({
      title: 'Sesión por vencer',
      text: 'Tu sesión vence en 5 minutos. ¿Deseas extenderla?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, extender',
      cancelButtonText: 'Cerrar sesión',
      background: '#1a0a2e',
      color: '#f0e6d3',
      iconColor: '#ffd700',
      confirmButtonColor: '#ffd700',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.refreshSession();
      } else {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  private refreshSession() {
    const token = this.authService.getToken();
    if (!token) {
      this.authService.logout();
      return;
    }
    this.authService.refreshToken(token).subscribe({
      next: (res) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('auth_user', JSON.stringify(res.user));
        }
        this.authService.currentUser.set(res.user);
        this.authService.isAuthenticated.set(true);
        this.start();
      },
      error: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      },
    });
  }

  ngOnDestroy() {
    this.stop();
  }
}
