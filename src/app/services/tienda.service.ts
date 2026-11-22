
import { Injectable } from '@angular/core';

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
}

export interface ItemCarrito extends Producto {
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class TiendaService {

  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Croquetas Premium Perro Adulto',
      precio: 1450,
      descripcion: 'Alimento completo con pollo y arroz.',
      imagen: 'assets/productos/croquetas.jpg'
    },
    {
      id: 2,
      nombre: 'Pelota mordedora resistente',
      precio: 350,
      descripcion: 'Juguete ideal para mantener activo a tu perro.',
      imagen: 'assets/productos/pelota.jpg'
    },
    {
      id: 3,
      nombre: 'Collar ajustable reflectante',
      precio: 475,
      descripcion: 'Collar cómodo y seguro para paseos.',
      imagen: 'assets/productos/collar.jpg'
    }
  ];

  carrito: ItemCarrito[] = [];

  get cantidadCarrito(): number {
    return this.carrito.reduce(
      (total, item) => total + item.cantidad,
      0
    );
  }

  get totalCarrito(): number {
    return this.carrito.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    );
  }

  agregarAlCarrito(producto: Producto) {
    const existente = this.carrito.find(
      item => item.id === producto.id
    );

    if (existente) {
      existente.cantidad++;
    } else {
      this.carrito.push({
        ...producto,
        cantidad: 1
      });
    }
  }

  eliminarDelCarrito(id: number) {
    this.carrito = this.carrito.filter(
      item => item.id !== id
    );
  }
}
