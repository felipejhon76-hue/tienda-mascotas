
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonButton,
  IonCard,
  IonCardContent
} from '@ionic/angular';

import { TiendaService } from '../services/tienda.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonButton,
    IonCard,
    IonCardContent
  ],
  template: `
    <ion-header>
      <ion-toolbar>

        <ion-buttons slot="start">
          <ion-back-button
            defaultHref="/home">
          </ion-back-button>
        </ion-buttons>

        <ion-title>Mi carrito</ion-title>

      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <h2>Productos en mi carrito</h2>

      <p class="instruccion">
        Desliza un producto hacia la izquierda
        para eliminarlo.
      </p>

      @if (tienda.carrito.length === 0) {

        <ion-card>
          <ion-card-content>

            <h3>Tu carrito está vacío</h3>

            <p>
              Agrega productos desde el catálogo.
            </p>

            <ion-button
              expand="block"
              routerLink="/home">

              Ver catálogo

            </ion-button>

          </ion-card-content>
        </ion-card>

      } @else {

        <ion-list>

          @for (item of tienda.carrito; track item.id) {

            <ion-item-sliding>

              <ion-item>
                <ion-label>

                  <h2>{{ item.nombre }}</h2>

                  <p>
                    Cantidad: {{ item.cantidad }}
                  </p>

                  <p>
                    Precio: RD$ {{ item.precio }}
                  </p>

                  <h3>
                    Subtotal:
                    RD$ {{ item.precio * item.cantidad }}
                  </h3>

                </ion-label>
              </ion-item>

              <ion-item-options side="end">

                <ion-item-option
                  color="danger"
                  (click)="eliminarProducto(item.id)">

                  Eliminar

                </ion-item-option>

              </ion-item-options>

            </ion-item-sliding>

          }

        </ion-list>

        <div class="resumen">

          <p>
            Productos: {{ tienda.cantidadCarrito }}
          </p>

          <h2>
            Total: RD$ {{ tienda.totalCarrito }}
          </h2>

        </div>

        <ion-button
          expand="block"
          routerLink="/finalizar">

          Finalizar compra

        </ion-button>

        <ion-button
          expand="block"
          fill="outline"
          routerLink="/home">

          Seguir comprando

        </ion-button>

      }

    </ion-content>
  `,
  styles: [`
    ion-toolbar {
      --background: #1f8a8a;
      --color: #ffffff;
    }

    ion-content {
      --background: #f5f7f8;
      --color: #20292c;
    }

    h2 {
      color: #20292c;
      font-weight: bold;
    }

    .instruccion {
      color: #59666b;
      font-size: 14px;
      margin-bottom: 20px;
    }

    ion-list {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
    }

    ion-item {
      --background: #ffffff;
      --color: #20292c;
    }

    ion-label h2 {
      font-size: 16px;
      font-weight: bold;
      color: #20292c;
    }

    ion-label p {
      color: #59666b;
    }

    ion-label h3 {
      font-weight: bold;
      color: #1f7777;
      margin-top: 8px;
    }

    ion-card {
      --background: #ffffff;
      --color: #20292c;
      border-radius: 14px;
    }

    .resumen {
      background: #ffffff;
      padding: 18px;
      margin: 20px 0;
      border-radius: 12px;
    }

    .resumen p {
      color: #59666b;
    }

    .resumen h2 {
      color: #1f7777;
    }

    ion-button {
      --background: #1f8a8a;
      --color: #ffffff;
      --border-radius: 10px;
      text-transform: none;
      margin-top: 12px;
    }
  `]
})
export class CarritoPage {

  constructor(public tienda: TiendaService) {}

  eliminarProducto(id: number) {
    this.tienda.eliminarDelCarrito(id);
  }
}
