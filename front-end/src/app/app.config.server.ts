import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { withRoutes, RenderMode } from '@angular/ssr';
import type { ServerRoute } from '@angular/ssr';
import { appConfig } from './app.config';

const serverRoutes: ServerRoute[] = [
  {
    path: '/publicaciones/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    withRoutes(serverRoutes),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
