import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
  computed,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonProgressBar,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
  ActionSheetController,
  ActionSheetButton,
  AlertController,
  ToastController,
  GestureController,
  Gesture
} from '@ionic/angular';

import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { addIcons } from 'ionicons';
import {
  add,
  ellipsisVertical,
  receiptOutline,
  repeatOutline,
  closeCircleOutline,
  closeOutline,
  chevronDownOutline,
  chevronUpOutline,
  locationOutline,
  handLeftOutline
} from 'ionicons/icons';

import {
  CuentaService,
  EstadoPedido,
  Pedido
} from '../services/cuenta.service';

import { TiendaService } from '../services/tienda.service';

type Filtro = 'todos' | 'activos' | 'historial';

const DURACION_LONG_PRESS = 500; // milisegundos
const TOLERANCIA_MOVIMIENTO = 10; // píxeles

@Component({
  selector: 'app-pedidos',
  templateUrl: 'pedidos.page.html',
  styleUrls: ['pedidos.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonProgressBar,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon
  ]
})
export class PedidosPage implements AfterViewInit, OnDestroy {

  @ViewChildren('tarjetaPedido', { read: ElementRef })
  tarjetas!: QueryList<ElementRef<HTMLElement>>;

  filtro = signal<Filtro>('todos');

  pedidosFiltrados = computed(() => {
    const pedidos = this.cuenta.pedidos();

    switch (this.filtro()) {
      case 'activos':
        return pedidos.filter(p => p.estado === 'Preparando' || p.estado === 'En camino');
      case 'historial':
        return pedidos.filter(p => p.estado === 'Entregado' || p.estado === 'Cancelado');
      default:
        return pedidos;
    }
  });

  // Pedido que se está presionando (para el efecto visual)
  presionado = signal<number | null>(null);

  // Pedido con el detalle desplegado
  expandido = signal<number | null>(null);

  // LONG-PRESS

  private gestos: Gesture[] = [];
  private suscripcion?: Subscription;
  private temporizador: ReturnType<typeof setTimeout> | null = null;
  private ultimoLongPress = 0;
  private hojaAbierta = false;

  constructor(
    public cuenta: CuentaService,
    private tienda: TiendaService,
    private gestureController: GestureController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({
      add,
      ellipsisVertical,
      receiptOutline,
      repeatOutline,
      closeCircleOutline,
      closeOutline,
      chevronDownOutline,
      chevronUpOutline,
      locationOutline,
      handLeftOutline
    });
  }

  // GESTO 4: LONG-PRESS CON GESTURECONTROLLER

  ngAfterViewInit() {
    // Las tarjetas solo existen después de pintar la vista
    this.crearGestos();

    // Si cambia el filtro, cambian las tarjetas: vuelvo a crear los gestos
    this.suscripcion = this.tarjetas.changes.subscribe(() => this.crearGestos());
  }

  private crearGestos() {
    this.destruirGestos();

    this.gestos = this.tarjetas.map(referencia => {
      const tarjeta = referencia.nativeElement;
      const idPedido = Number(tarjeta.dataset['pedido']);

      const gesto = this.gestureController.create({
        el: tarjeta,
        gestureName: 'long-press-pedido',
        threshold: 0, // onStart se dispara apenas el dedo toca la tarjeta
        onStart: () => this.iniciarPulsacion(idPedido),
        onMove: detalle => {
          // Si el dedo se movió, es scroll, no long-press
          if (Math.hypot(detalle.deltaX, detalle.deltaY) > TOLERANCIA_MOVIMIENTO) {
            this.cancelarPulsacion();
          }
        },
        onEnd: () => this.cancelarPulsacion()
      }, true);

      // Sin enable() el gesto existe, pero no escucha nada
      gesto.enable();

      return gesto;
    });
  }

  private iniciarPulsacion(idPedido: number) {
    this.cancelarPulsacion();
    this.presionado.set(idPedido);

    this.temporizador = setTimeout(() => {
      this.temporizador = null;
      this.presionado.set(null);
      this.ultimoLongPress = Date.now();

      // Vibración corta en el celular (en el navegador no hace nada)
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => undefined);

      const pedido = this.cuenta.pedidos().find(p => p.id === idPedido);

      if (pedido) {
        void this.abrirOpciones(pedido);
      }
    }, DURACION_LONG_PRESS);
  }

  cancelarPulsacion() {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }

    this.presionado.set(null);
  }

  /*
   * En Android, el sistema también reconoce el long-press y lanza
   * "contextmenu". Lo bloqueo para que no salga el menú del navegador
   * y abro el mío. En PC, el clic derecho hace lo mismo.
   */
  alMenuContextual(event: Event, pedido: Pedido) {
    event.preventDefault();
    this.cancelarPulsacion();
    this.ultimoLongPress = Date.now();
    void this.abrirOpciones(pedido);
  }

  private destruirGestos() {
    this.gestos.forEach(gesto => gesto.destroy());
    this.gestos = [];
  }

  ngOnDestroy() {
    this.cancelarPulsacion();
    this.suscripcion?.unsubscribe();
    this.destruirGestos();
  }

  // MENU CONTEXTUAL DEL PEDIDO

  async abrirOpciones(pedido: Pedido) {
    if (this.hojaAbierta) {
      return;
    }

    this.hojaAbierta = true;

    const botones: ActionSheetButton[] = [
      {
        text: this.expandido() === pedido.id ? 'Ocultar productos' : 'Ver productos',
        icon: 'receipt-outline',
        handler: () => {
          this.alternarDetalle(pedido.id);
        }
      },
      {
        text: 'Repetir pedido',
        icon: 'repeat-outline',
        handler: () => {
          void this.repetirPedido(pedido);
        }
      }
    ];

    if (pedido.estado === 'Preparando') {
      botones.push({
        text: 'Cancelar pedido',
        icon: 'close-circle-outline',
        role: 'destructive',
        handler: () => {
          void this.confirmarCancelacion(pedido);
        }
      });
    }

    botones.push({
      text: 'Cerrar',
      icon: 'close-outline',
      role: 'cancel'
    });

    const hoja = await this.actionSheetController.create({
      header: `Pedido #${pedido.id}`,
      subHeader: `${pedido.estado} · RD$ ${this.cuenta.totalPedido(pedido)}`,
      buttons: botones
    });

    void hoja.onDidDismiss().then(() => {
      this.hojaAbierta = false;
    });

    await hoja.present();
  }

  // Botón ⋮: la misma hoja sin usar el gesto
  abrirOpcionesConBoton(pedido: Pedido) {
    if (this.acabaDeHaberLongPress()) {
      return;
    }

    void this.abrirOpciones(pedido);
  }

  // Botón "Ver productos" de la tarjeta
  alPulsarVerProductos(idPedido: number) {
    if (this.acabaDeHaberLongPress()) {
      return;
    }

    this.alternarDetalle(idPedido);
  }

  alternarDetalle(idPedido: number) {
    this.expandido.update(actual => (actual === idPedido ? null : idPedido));
  }

  verProducto(productoId: number) {
    // Al soltar un long-press el navegador manda un "click": lo ignoro
    if (this.acabaDeHaberLongPress()) {
      return;
    }

    void this.router.navigate(['/producto', productoId]);
  }

  private acabaDeHaberLongPress(): boolean {
    return Date.now() - this.ultimoLongPress < 700;
  }

  private async repetirPedido(pedido: Pedido) {
    let agregados = 0;

    for (const linea of pedido.lineas) {
      const producto = this.tienda.productos.find(p => p.id === linea.productoId);

      if (!producto) {
        continue;
      }

      for (let i = 0; i < linea.cantidad; i++) {
        this.tienda.agregarAlCarrito(producto);
        agregados++;
      }
    }

    const toast = await this.toastController.create({
      message: `Agregué ${agregados} producto(s) a tu carrito`,
      duration: 3500,
      position: 'bottom',
      buttons: [
        {
          text: 'Ver carrito',
          handler: () => {
            void this.router.navigateByUrl('/carrito');
          }
        }
      ]
    });

    await toast.present();
  }

  private async confirmarCancelacion(pedido: Pedido) {
    const alerta = await this.alertController.create({
      header: `¿Cancelar el pedido #${pedido.id}?`,
      message: 'Todavía se está preparando, así que puedes cancelarlo sin costo.',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, cancelar',
          role: 'destructive',
          handler: () => {
            this.cuenta.cancelarPedido(pedido.id);
            void this.mostrarMensaje(`Pedido #${pedido.id} cancelado`);
          }
        }
      ]
    });

    await alerta.present();
  }

  // ---------- AYUDANTES DE LA VISTA ----------

  cambiarFiltro(valor: unknown) {
    if (valor === 'todos' || valor === 'activos' || valor === 'historial') {
      this.filtro.set(valor);
    }
  }

  progreso(estado: EstadoPedido): number {
    const valores: Record<EstadoPedido, number> = {
      'Preparando': 0.33,
      'En camino': 0.66,
      'Entregado': 1,
      'Cancelado': 1
    };

    return valores[estado];
  }

  claseEstado(estado: EstadoPedido): string {
    return 'estado-' + estado.toLowerCase().replace(' ', '-');
  }

  imagenDe(productoId: number): string {
    return this.tienda.productos.find(p => p.id === productoId)?.imagen ?? '';
  }

  private async mostrarMensaje(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2200,
      position: 'bottom'
    });

    await toast.present();
  }
}
