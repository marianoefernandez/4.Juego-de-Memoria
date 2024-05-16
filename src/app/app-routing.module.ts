import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { estaLogueadoGuard } from './guards/esta-logueado.guard';
import { noEstaLogueadoGuard } from './guards/no-esta-logueado.guard';

const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate:[estaLogueadoGuard]
  },
  {
    path: 'sesiones',
    loadChildren: () => import('./pages/sesiones/sesiones.module').then( m => m.SesionesPageModule),
    canActivate:[noEstaLogueadoGuard]
  },
  {
    path: "",
    loadChildren: () => import('./pages/splash/splash.module').then( m => m.SplashPageModule),
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
