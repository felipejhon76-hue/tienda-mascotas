
import { Component, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  ActionSheetController,
  AlertController
} from '@ionic/angular';

import {
  Producto,
  TiendaService
} from '../services/tienda.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonBadge,
    IonRefresher,
    IonRefresherContent
  ]
})
export class HomePage implements OnDestroy {

  constructor(
    public tienda: TiendaService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController
  ) {}

  mensajeActualizacion = '';

  // PINCH-TO-ZOOM

  zoom: Record<number, number> = {};
  distanciaInicial = 0;
  escalaInicial = 1;
  productoZoomActivo: number | null = null;

  // LONG-PRESS

  private temporizadorPulsacion:
    ReturnType<typeof setTimeout> | null = null;

  private posicionInicialX = 0;
  private posicionInicialY = 0;

  // CARRITO

  agregarAlCarrito(producto: Producto) {
    this.tienda.agregarAlCarrito(producto);
  }

  // PULL-TO-REFRESH

  actualizarCatalogo(event: any) {
    this.mensajeActualizacion = '';

    setTimeout(() => {
      this.tienda.productos = [
        ...this.tienda.productos
      ];

      this.mensajeActualizacion =
        'Catálogo actualizado correctamente';

      event.target.complete();
    }, 800);
  }

  // PINCH-TO-ZOOM

  obtenerDistancia(event: TouchEvent): number {
    const dedo1 = event.touches[0];
    const dedo2 = event.touches[1];

    return Math.hypot(
      dedo2.clientX - dedo1.clientX,
      dedo2.clientY - dedo1.clientY
    );
  }

  iniciarZoom(event: TouchEvent, id: number) {
    if (event.touches.length !== 2) {
      return;
    }

    this.productoZoomActivo = id;
    this.distanciaInicial = this.obtenerDistancia(event);
    this.escalaInicial = this.zoom[id] || 1;
  }

  moverZoom(event: TouchEvent, id: number) {
    if (
      event.touches.length !== 2 ||
      this.productoZoomActivo !== id ||
      this.distanciaInicial === 0
    ) {
      return;
    }

    event.preventDefault();

    const distanciaActual = this.obtenerDistancia(event);

    const escala =
      this.escalaInicial *
      (distanciaActual / this.distanciaInicial);

    this.zoom[id] = Math.max(
      1,
      Math.min(3, escala)
    );
  }

  terminarZoom(event: TouchEvent) {
    if (event.touches.length < 2) {
      this.distanciaInicial = 0;
      this.productoZoomActivo = null;
    }
  }

  restablecerZoom(id: number) {
    this.zoom[id] = 1;
  }

  // LONG-PRESS

  iniciarPulsacion(
    event: PointerEvent,
    producto: Producto
  ) {
    if (
      !event.isPrimary ||
      (event.pointerType === 'mouse' && event.button !== 0)
    ) {
      return;
    }

    this.cancelarPulsacion();

    this.posicionInicialX = event.clientX;
    this.posicionInicialY = event.clientY;

    this.temporizadorPulsacion = setTimeout(() => {
      this.temporizadorPulsacion = null;
      void this.mostrarOpciones(producto);
    }, 700);
  }

  moverPulsacion(event: PointerEvent) {
    if (!this.temporizadorPulsacion) {
      return;
    }

    const desplazamiento = Math.hypot(
      event.clientX - this.posicionInicialX,
      event.clientY - this.posicionInicialY
    );

    if (desplazamiento > 12) {
      this.cancelarPulsacion();
    }
  }

  cancelarPulsacion() {
    if (this.temporizadorPulsacion) {
      clearTimeout(this.temporizadorPulsacion);
      this.temporizadorPulsacion = null;
    }
  }

  async mostrarOpciones(producto: Producto) {
    const menu = await this.actionSheetController.create({
      header: producto.nombre,
      subHeader: 'Selecciona una opción',
      buttons: [
        {
          text: 'Añadir al carrito',
          icon: 'cart-outline',
          handler: () => {
            this.agregarAlCarrito(producto);
          }
        },
        {
          text: 'Ver detalles',
          icon: 'information-circle-outline',
          handler: () => {
            void this.mostrarDetalles(producto);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await menu.present();
  }

  async mostrarDetalles(producto: Producto) {
    const alerta = await this.alertController.create({
      header: producto.nombre,
      message:
        producto.descripcion +
        '<br><br>Precio: RD$ ' +
        producto.precio,
      buttons: ['Cerrar']
    });

    await alerta.present();
  }

  ngOnDestroy() {
    this.cancelarPulsacion();
  }
}
