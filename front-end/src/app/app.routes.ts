import { Routes } from '@angular/router';
import { Login } from './components/login/login'
import { Registro } from './components/registro/registro'
import { Publicaciones } from './components/publicaciones/publicaciones';
import { PerfilUsuario } from './components/perfil-usuario/perfil-usuario';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Registro },
  { path: 'publicaciones', component: Publicaciones, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilUsuario, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
