import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiImagePipe } from '../../pipes/api-image.pipe';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ApiImagePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected authService = inject(AuthService);
}
