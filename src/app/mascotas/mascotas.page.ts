import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAvatar,
  IonLabel,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonThumbnail,
  IonFab,
  IonFabButton,
  IonIcon,
  AlertController,
  ToastController,
  RefresherCustomEvent
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  add,
  trashOutline,
  medkitOutline,
  cutOutline,
  medicalOutline,
  fitnessOutline,
  notificationsOutline,
  chevronDownCircleOutline
} from 'ionicons/icons';

import {
  CuentaService,
  Especie,
  Mascota
} from '../services/cuenta.service';

import { TiendaService } from '../services/tienda.service';

@Component({
  selector: 'app-mascotas',
  templateUrl: 'mascotas.page.html',
  styleUrls: ['mascotas.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonAvatar,
    IonLabel,
    IonBadge,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonThumbnail,
    IonFab,
    IonFabButton,
    IonIcon
  ]
})
export class MascotasPage {

  constructor(
    public cuenta: CuentaService,
    public tienda: TiendaService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      add,
      trashOutline,
      medkitOutline,
      cutOutline,
      medicalOutline,
      fitnessOutline,
      notificationsOutline,
      chevronDownCircleOutline
    });
  }

  emoji(especie: Especie): string {
    const emojis: Record<Especie, string> = {
      Perro: '🐶',
      Gato: '🐱',
      Conejo: '🐰',
      Ave: '🐦',
      Otra: '🐾'
    };

    return emojis[especie];
  }

  horaSincronizacion(): string {
    const fecha = this.cuenta.ultimaSincronizacion();

    return fecha
      ? fecha.toLocaleTimeString('es-DO', { hour: 'numeric', minute: '2-digit' })
      : 'todavía no';
  }

  // GESTO 1: SWIPE PARA ELIMINAR

  /*
   * Se llama de dos formas:
   * 1) Swipe completo hacia la izquierda: (ionSwipe) en ion-item-options.
   * 2) Swipe corto + tocar el botón rojo "Eliminar".
   * Después del borrado aparece un toast con "Deshacer".
   */
  async eliminarMascota(mascota: Mascota) {
    const eliminada = this.cuenta.eliminarMascota(mascota.id);

    if (!eliminada) {
      return;
    }

    const toast = await this.toastController.create({
      message: `${mascota.nombre} se eliminó de tu perfil`,
      duration: 4000,
      position: 'bottom',
      buttons: [
        {
          text: 'Deshacer',
          handler: () => {
            this.cuenta.restaurarMascota(
              eliminada.mascota,
              eliminada.posicion
            );
          }
        }
      ]
    });

    await toast.present();
  }

  // Swipe hacia la derecha: marcar o desmarcar la vacuna

  marcarVacuna(mascota: Mascota, deslizable: IonItemSliding) {
    this.cuenta.alternarVacuna(mascota.id);
    void deslizable.close();
  }

  // GESTO 2: PULL-TO-REFRESH

  sincronizarRecordatorios(event: RefresherCustomEvent) {
    // Simula la consulta a la veterinaria (como una llamada HTTP)
    setTimeout(() => {
      const nuevos = this.cuenta.sincronizarRecordatorios();

      void event.target.complete();

      void this.mostrarMensaje(
        nuevos > 0
          ? 'Llegó un recordatorio nuevo de la veterinaria'
          : 'Tus recordatorios ya están al día'
      );
    }, 1200);
  }

  // BOTÓN FLOTANTE: AGREGAR MASCOTA

  async agregarMascota() {
    const alerta = await this.alertController.create({
      header: 'Nueva mascota',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre (obligatorio)' },
        { name: 'especie', type: 'text', placeholder: 'Especie: Perro, Gato, Conejo...' },
        { name: 'raza', type: 'text', placeholder: 'Raza' },
        { name: 'edad', type: 'text', placeholder: 'Edad (ej. 2 años)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (datos: { nombre: string; especie: string; raza: string; edad: string }) => {
            const nombre = datos.nombre?.trim();

            if (!nombre) {
              return false;
            }

            this.cuenta.agregarMascota(
              nombre,
              this.normalizarEspecie(datos.especie),
              datos.raza?.trim(),
              datos.edad?.trim()
            );

            void this.mostrarMensaje(`${nombre} se agregó a tus mascotas`);
            return true;
          }
        }
      ]
    });

    await alerta.present();
  }

  private normalizarEspecie(texto: string): Especie {
    const valor = (texto || '').trim().toLowerCase();

    if (valor.startsWith('perr')) return 'Perro';
    if (valor.startsWith('gat')) return 'Gato';
    if (valor.startsWith('conej')) return 'Conejo';
    if (valor.startsWith('ave') || valor.startsWith('pájar') || valor.startsWith('pajar')) return 'Ave';

    return 'Otra';
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
