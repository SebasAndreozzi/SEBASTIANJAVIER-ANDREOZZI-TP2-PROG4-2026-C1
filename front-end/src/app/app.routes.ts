import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { PerfilUsuario } from './components/perfil-usuario/perfil-usuario';
import { Publicaciones } from './components/publicaciones/publicaciones';
import { Component } from '@angular/core';

export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'signup', component: Registro},
    /* ver cuando login
    { path: 'users/:id', loadComponent: () => import('./components/user-detail/user-detail').then(m => m.UserDetail),
        canActivate: [userExists],
        resolve: {user: userResolver}
     },
     */
    { path: 'publicaciones', component: Publicaciones},
    { path: 'login', component: Login },
    { path: '**', redirectTo: 'login' }

];