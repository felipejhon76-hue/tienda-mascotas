
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

import {
  TiendaService
} from '../services/tienda.service';

@Component({
  selector: 'app-finalizar',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon
  ],
  template: `
    <ion-header>
      <ion-toolbar>

        <ion-buttons slot="start">
          <ion-back-button
            defaultHref="/carrito">
          </ion-back-button>
        </ion-buttons>

        <ion-title>Finalizar compra</ion-title>

      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <!-- PEDIDO CONFIRMADO -->

      @if (pedidoConfirmado) {

        <ion-card>
          <ion-card-content class="confirmacion">

            <div class="icono-exito">✓</div>

            <h2>¡Pedido confirmado!</h2>

            <p>
              Gracias por tu compra,
              {{ nombreConfirmado }}.
            </p>

            <p>
              Tu pedido de prueba se ha
              registrado correctamente
              en esta sesión.
            </p>

            <h2>
              Total: RD$ {{ totalConfirmado }}
            </h2>

            <ion-button
              expand="block"
              routerLink="/home">

              Volver al catálogo

            </ion-button>

          </ion-card-content>
        </ion-card>

      } @else if (tienda.carrito.length === 0) {

        <!-- CARRITO VACIO -->

        <h2>Tu carrito está vacío</h2>

        <p>
          Agrega productos antes de finalizar
          una compra.
        </p>

        <ion-button
          expand="block"
          routerLink="/home">

          Ver catálogo

        </ion-button>

      } @else {

        <!-- DATOS DE ENTREGA -->

        <h2>Datos de entrega</h2>

        <p class="subtitulo">
          Completa tus datos para continuar.
        </p>

        <ion-card>
          <ion-card-content>

            <ion-list>

              <ion-item>
                <ion-input
                  label="Nombre completo"
                  label-placement="stacked"
                  placeholder="Escribe tu nombre"
                  [(ngModel)]="nombre">
                </ion-input>
              </ion-item>

              <ion-item>
                <ion-input
                  label="Teléfono"
                  label-placement="stacked"
                  placeholder="8091234567"
                  type="tel"
                  [(ngModel)]="telefono">
                </ion-input>
              </ion-item>

              <ion-item>
                <ion-textarea
                  label="Dirección de entrega"
                  label-placement="stacked"
                  placeholder="Calle, número y sector"
                  [autoGrow]="true"
                  [(ngModel)]="direccion">
                </ion-textarea>
              </ion-item>

            </ion-list>

          </ion-card-content>
        </ion-card>

        <!-- RESUMEN -->

        <h2>Resumen del pedido</h2>

        <ion-card>
          <ion-card-content>

            <ion-list>

              @for (item of tienda.carrito; track item.id) {

                <ion-item>
                  <ion-label>

                    <h3>{{ item.nombre }}</h3>

                    <p>
                      Cantidad: {{ item.cantidad }}
                    </p>

                    <p>
                      RD$
                      {{ item.precio * item.cantidad }}
                    </p>

                  </ion-label>
                </ion-item>

              }

            </ion-list>

            <h2 class="total">
              Total: RD$ {{ tienda.totalCarrito }}
            </h2>

          </ion-card-content>
        </ion-card>

        @if (error) {

          <p class="mensaje-error">
            {{ error }}
          </p>

        }

        <ion-button
          expand="block"
          (click)="confirmarPedido()">

          Confirmar pedido

        </ion-button>

        <p class="aviso">
          Esta es una compra de demostración.
          No se realizará ningún pago ni envío real.
        </p>

      }

      <!-- BOTON FLOTANTE PARA VOLVER AL CARRITO -->

      @if (!pedidoConfirmado) {

        <ion-fab
          slot="fixed"
          vertical="bottom"
          horizontal="end">

          <ion-fab-button
            routerLink="/carrito"
            aria-label="Volver al carrito">

            <ion-icon
              name="arrow-back-outline">
            </ion-icon>

          </ion-fab-button>

        </ion-fab>

      }

    </ion-content>
  `,
  styles: [`
    ion-toolbar {
      --background: #1f8a8a;
      --color: white;
    }

    ion-content {
      --background: #f5f7f8;
      --color: #20292c;
    }

    h2 {
      color: #20292c;
      font-size: 22px;
      font-weight: bold;
    }

    .subtitulo {
      color: #59666b;
    }

    ion-card {
      --background: #ffffff;
      --color: #20292c;
      border-radius: 14px;
      margin: 16px 0;
    }

    ion-list {
      background: #ffffff;
    }

    ion-item {
      --background: #ffffff;
      --color: #20292c;
    }

    ion-input,
    ion-textarea {
      --color: #20292c;
      --placeholder-color: #59666b;
    }

    ion-label h3 {
      color: #20292c;
      font-weight: bold;
    }

    ion-label p {
      color: #59666b;
    }

    .total {
      color: #1f7777;
      margin-top: 16px;
    }

    ion-button {
      --background: #1f8a8a;
      --color: white;
      --border-radius: 10px;
      text-transform: none;
      font-weight: bold;
      margin-top: 18px;
    }

    ion-fab-button {
      --background: #1f8a8a;
      --color: #ffffff;
    }

    .mensaje-error {
      color: #b3261e;
      font-weight: bold;
      padding: 10px;
    }

    .aviso {
      color: #59666b;
      font-size: 13px;
      text-align: center;
      margin-top: 18px;
    }

    .confirmacion {
      text-align: center;
      padding: 30px 18px;
    }

    .confirmacion p {
      color: #59666b;
      line-height: 1.6;
    }

    .icono-exito {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 10px auto 20px;
      width: 70px;
      height: 70px;
      background: #198754;
      color: white;
      border-radius: 50%;
      font-size: 40px;
    }
  `]
})
export class FinalizarPage {

  nombre = '';
  telefono = '';
  direccion = '';
  error = '';

  pedidoConfirmado = false;
  nombreConfirmado = '';
  totalConfirmado = 0;

  constructor(public tienda: TiendaService) {
    addIcons({ arrowBackOutline });
  }

  confirmarPedido() {
    this.error = '';

    if (this.nombre.trim().length < 2) {
      this.error = 'Introduce tu nombre completo.';
      return;
    }

    const numero = this.telefono.replace(/\D/g, '');

    if (numero.length !== 10) {
      this.error = 'Introduce un teléfono de 10 dígitos.';
      return;
    }

    if (this.direccion.trim().length < 5) {
      this.error = 'Introduce una dirección válida.';
      return;
    }

    if (this.tienda.carrito.length === 0) {
      this.error = 'Tu carrito está vacío.';
      return;
    }

    this.nombreConfirmado = this.nombre.trim();
    this.totalConfirmado = this.tienda.totalCarrito;

    this.tienda.carrito = [];
    this.pedidoConfirmado = true;
  }
}
