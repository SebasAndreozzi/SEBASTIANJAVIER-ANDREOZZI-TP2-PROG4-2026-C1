import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SessionTimerService } from '../../services/session-timer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { passwordStrengthValidator } from '../../services/validators';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private sessionTimer = inject(SessionTimerService);

  errorMessage = signal('');
  loading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]],
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;
    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.sessionTimer.start();
        this.router.navigate(['/publicaciones']);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.message || 'Error al iniciar sesión');
        this.loading.set(false);
      },
    });
  }
}
