
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then(
        m => m.HomePage
      )
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./carrito/carrito.page').then(
        m => m.CarritoPage
      )
  },
  {
    path: 'finalizar',
    loadComponent: () =>
      import('./finalizar/finalizar.page').then(
        m => m.FinalizarPage
      )
  },
  {
    path: 'mascotas',
    loadComponent: () =>
      import('./mascotas/mascotas.page').then(
        m => m.MascotasPage
      )
  },
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('./detalle-producto/detalle-producto.page').then(
        m => m.DetalleProductoPage
      )
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('./pedidos/pedidos.page').then(
        m => m.PedidosPage
      )
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
