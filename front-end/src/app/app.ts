import { Component, inject, OnInit, signal, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './services/auth.service';
import { SessionTimerService } from './services/session-timer.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    @if (loading()) {
      <div class="splash-screen">
        <div class="splash-content">
          <div class="splash-logo">
            <img src="/favicon.ico" alt="SC" class="splash-icon" />
          </div>
          <h1 class="splash-title">S-CARD</h1>
          <div class="spinner"></div>
          <p class="splash-message">Validando sesión...</p>
        </div>
      </div>
    } @else {
      <router-outlet />
    }
  `,
  styles: [`
    .splash-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100dvh;
      background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0d0d2b 100%);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .splash-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .splash-logo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffd700, #b8860b);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
      margin-bottom: 0.5rem;
    }
    .splash-icon {
      width: 44px;
      height: 44px;
      border-radius: 8px;
    }
    .splash-title {
      font-family: 'Nunito', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #ffd700;
      margin: 0;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 215, 0, 0.15);
      border-top-color: #ffd700;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .splash-message {
      color: #8b7ba8;
      font-size: 0.9rem;
      margin: 0;
    }
  `],
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private sessionTimer = inject(SessionTimerService);

  loading = signal(true);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      this.authService.authorize(token).subscribe({
        next: (res) => {
          this.authService.currentUser.set(res.user);
          this.authService.isAuthenticated.set(true);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('auth_user', JSON.stringify(res.user));
          }
          this.sessionTimer.start();
          this.loading.set(false);
          this.router.navigate(['/publicaciones']);
        },
        error: () => {
          this.authService.logout();
          this.loading.set(false);
          this.router.navigate(['/login']);
        },
      });
    } else {
      this.loading.set(false);
      this.router.navigate(['/login']);
    }
  }
}
