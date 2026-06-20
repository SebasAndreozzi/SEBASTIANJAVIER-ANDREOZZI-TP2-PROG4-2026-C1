import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected authService = inject(AuthService);
}
