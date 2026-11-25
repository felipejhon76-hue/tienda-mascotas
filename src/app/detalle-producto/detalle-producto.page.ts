import { Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  add,
  remove,
  refreshOutline,
  cartOutline,
  heart,
  heartOutline,
  bagHandleOutline,
  pricetagOutline,
  cubeOutline,
  pawOutline,
  checkmarkCircleOutline,
  expandOutline
} from 'ionicons/icons';

import {
  Producto,
  TiendaService
} from '../services/tienda.service';

interface FichaTecnica {
  categoria: string;
  presentacion: string;
  idealPara: string;
  disponibilidad: string;
}

// Datos extra de cada producto para la ficha técnica
const FICHAS: Record<number, FichaTecnica> = {
  1: {
    categoria: 'Alimento',
    presentacion: 'Saco de 4 kg',
    idealPara: 'Perros adultos',
    disponibilidad: 'En existencia'
  },
  2: {
    categoria: 'Juguete',
    presentacion: 'Caucho resistente',
    idealPara: 'Perros medianos y grandes',
    disponibilidad: 'En existencia'
  },
  3: {
    categoria: 'Accesorio',
    presentacion: 'Ajustable de 35 a 50 cm',
    idealPara: 'Paseos de día y de noche',
    disponibilidad: 'Pocas unidades'
  }
};

const ESCALA_MINIMA = 1;
const ESCALA_MAXIMA = 4;

@Component({
  selector: 'app-detalle-producto',
  templateUrl: 'detalle-producto.page.html',
  styleUrls: ['detalle-producto.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonChip,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonNote,
    IonButton,
    IonFab,
    IonFabButton,
    IonFabList,
    IonIcon
  ]
})
export class DetalleProductoPage {

  @ViewChild('visor') visor?: ElementRef<HTMLElement>;

  producto?: Producto;
  ficha?: FichaTecnica;

  favorito = signal(false);

  // ESTADO DEL ZOOM

  escala = signal(1);
  desplazamientoX = signal(0);
  desplazamientoY = signal(0);
  animando = signal(false);

  transformacion = computed(() =>
    `translate(${this.desplazamientoX()}px, ${this.desplazamientoY()}px) scale(${this.escala()})`
  );

  // Dedos que están tocando el visor (pointerId -> posición)
  private punteros = new Map<number, { x: number; y: number }>();

  private distanciaInicial = 0;
  private escalaInicial = 1;
  private huboPinch = false;

  private arrastre = { x: 0, y: 0, origenX: 0, origenY: 0 };
  private toqueInicio = { x: 0, y: 0, tiempo: 0 };
  private ultimoToque = 0;

  constructor(
    route: ActivatedRoute,
    private tienda: TiendaService,
    private toastController: ToastController
  ) {
    addIcons({
      add,
      remove,
      refreshOutline,
      cartOutline,
      heart,
      heartOutline,
      bagHandleOutline,
      pricetagOutline,
      cubeOutline,
      pawOutline,
      checkmarkCircleOutline,
      expandOutline
    });

    const id = Number(route.snapshot.paramMap.get('id'));

    this.producto = this.tienda.productos.find(p => p.id === id);
    this.ficha = FICHAS[id];
  }

  // GESTO 3: PINCH / ZOOM CON POINTER EVENTS

  /*
   * El GestureController de Ionic sigue un solo dedo (no trae "scale"),
   * así que el pinch se hace con Pointer Events: guardo la posición de
   * cada dedo y comparo la distancia entre los dos con la distancia
   * inicial. Con la imagen ampliada, un dedo la mueve y un doble
   * toque alterna entre x1 y x2.5.
   */

  alPresionar(event: PointerEvent) {
    const visor = event.currentTarget as HTMLElement;
    visor.setPointerCapture(event.pointerId);

    this.punteros.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.animando.set(false);

    if (this.punteros.size === 1) {
      this.huboPinch = false;
      this.toqueInicio = { x: event.clientX, y: event.clientY, tiempo: event.timeStamp };
      this.iniciarArrastre(event.clientX, event.clientY);
    }

    if (this.punteros.size === 2) {
      this.huboPinch = true;
      this.distanciaInicial = this.distanciaEntreDedos();
      this.escalaInicial = this.escala();
    }
  }

  alMover(event: PointerEvent) {
    if (!this.punteros.has(event.pointerId)) {
      return;
    }

    this.punteros.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.punteros.size >= 2 && this.distanciaInicial > 0) {
      // PINCH: la escala cambia según cuánto se separan los dedos
      const proporcion = this.distanciaEntreDedos() / this.distanciaInicial;
      this.aplicarEscala(this.escalaInicial * proporcion);
      return;
    }

    if (this.punteros.size === 1 && this.escala() > 1) {
      // ARRASTRE: con la imagen ampliada se puede mover con un dedo
      this.desplazamientoX.set(this.arrastre.origenX + event.clientX - this.arrastre.x);
      this.desplazamientoY.set(this.arrastre.origenY + event.clientY - this.arrastre.y);
      this.limitarDesplazamiento();
    }
  }

  alSoltar(event: PointerEvent) {
    if (!this.punteros.has(event.pointerId)) {
      return;
    }

    const eraElUltimoDedo = this.punteros.size === 1;
    this.punteros.delete(event.pointerId);

    if (this.punteros.size < 2) {
      this.distanciaInicial = 0;
    }

    // Si queda un dedo después del pinch, sigue arrastrando desde ahí
    if (this.punteros.size === 1) {
      const [dedo] = this.punteros.values();
      this.iniciarArrastre(dedo.x, dedo.y);
    }

    if (event.type === 'pointerup' && eraElUltimoDedo && !this.huboPinch) {
      this.detectarDobleToque(event);
    }
  }

  // BOTONES DE ZOOM (alternativa para quien no puede usar dos dedos)

  acercar() {
    this.animando.set(true);
    this.aplicarEscala(this.escala() + 0.5);
  }

  alejar() {
    this.animando.set(true);
    this.aplicarEscala(this.escala() - 0.5);
  }

  restablecerZoom() {
    this.animando.set(true);
    this.aplicarEscala(1);
  }

  // ACCIONES DEL BOTON FLOTANTE

  async agregarAlCarrito() {
    if (!this.producto) {
      return;
    }

    this.tienda.agregarAlCarrito(this.producto);
    await this.mostrarMensaje(`${this.producto.nombre} se añadió al carrito`);
  }

  async alternarFavorito() {
    this.favorito.update(valor => !valor);

    await this.mostrarMensaje(
      this.favorito() ? 'Guardado en favoritos' : 'Quitado de favoritos'
    );
  }

  // ---------- AYUDANTES DEL ZOOM ----------

  private distanciaEntreDedos(): number {
    const [dedo1, dedo2] = [...this.punteros.values()];

    return Math.hypot(dedo2.x - dedo1.x, dedo2.y - dedo1.y);
  }

  private iniciarArrastre(x: number, y: number) {
    this.arrastre = {
      x,
      y,
      origenX: this.desplazamientoX(),
      origenY: this.desplazamientoY()
    };
  }

  private aplicarEscala(valor: number) {
    const escala = Math.min(ESCALA_MAXIMA, Math.max(ESCALA_MINIMA, valor));

    if (escala <= 1.01) {
      this.escala.set(1);
      this.desplazamientoX.set(0);
      this.desplazamientoY.set(0);
      return;
    }

    this.escala.set(escala);
    this.limitarDesplazamiento();
  }

  // Evita que la imagen ampliada se salga del visor
  private limitarDesplazamiento() {
    const visor = this.visor?.nativeElement;

    if (!visor) {
      return;
    }

    const maxX = ((this.escala() - 1) * visor.clientWidth) / 2;
    const maxY = ((this.escala() - 1) * visor.clientHeight) / 2;

    this.desplazamientoX.set(Math.min(maxX, Math.max(-maxX, this.desplazamientoX())));
    this.desplazamientoY.set(Math.min(maxY, Math.max(-maxY, this.desplazamientoY())));
  }

  private detectarDobleToque(event: PointerEvent) {
    const movimiento = Math.hypot(
      event.clientX - this.toqueInicio.x,
      event.clientY - this.toqueInicio.y
    );
    const duracion = event.timeStamp - this.toqueInicio.tiempo;

    // Si el dedo se movió o tardó mucho, fue un arrastre, no un toque
    if (movimiento > 10 || duracion > 250) {
      return;
    }

    if (event.timeStamp - this.ultimoToque < 300) {
      this.ultimoToque = 0;
      this.animando.set(true);
      this.aplicarEscala(this.escala() > 1 ? 1 : 2.5);
    } else {
      this.ultimoToque = event.timeStamp;
    }
  }

  private async mostrarMensaje(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1800,
      position: 'top'
    });

    await toast.present();
  }
}
