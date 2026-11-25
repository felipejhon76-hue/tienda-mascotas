
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonMenuToggle,
  IonListHeader,
  IonBadge,
  IonFooter
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  pawOutline,
  cartOutline,
  receiptOutline,
  heartOutline,
  cubeOutline,
  timeOutline
} from 'ionicons/icons';

import { TiendaService } from './services/tienda.service';
import { CuentaService } from './services/cuenta.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonRouterOutlet,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuToggle,
    IonListHeader,
    IonBadge,
    IonFooter
  ],
  styles: [`
    ion-menu ion-toolbar {
      --background: #1f8a8a;
      --color: white;
    }

    ion-menu ion-content {
      --background: #f5f7f8;
    }

    .menu-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 22px 16px;
      background: #e2f3f1;
      color: #20292c;
    }

    .menu-logo ion-icon {
      font-size: 38px;
      color: #1f8a8a;
    }

    .menu-logo h2 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }

    .menu-logo p {
      margin: 4px 0 0;
      font-size: 13px;
      color: #59666b;
    }

    ion-menu ion-list {
      background: transparent;
      padding-top: 12px;
    }

    ion-menu ion-item {
      --background: transparent;
      --color: #20292c;
      --border-radius: 10px;
      margin: 6px 10px;
    }

    ion-menu ion-item ion-icon {
      color: #1f8a8a;
      font-size: 23px;
    }

    /* SECCIONES, OPCION ACTIVA Y CONTADORES */

    ion-menu ion-list-header {
      --color: #59666b;
      min-height: 32px;
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    ion-menu ion-item.opcion-activa {
      --background: #e2f3f1;
      --color: #1f7777;
      font-weight: bold;
    }

    ion-menu ion-badge {
      --background: #1f8a8a;
      --color: #ffffff;
      border-radius: 10px;
    }

    .menu-pie {
      background: #f5f7f8;
      border-top: 1px solid #dfe6e7;
    }

    .menu-pie p {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0;
      padding: 12px 16px;
      font-size: 12px;
      color: #59666b;
    }

    .menu-pie ion-icon {
      color: #1f8a8a;
      font-size: 16px;
    }
  `]
})
export class AppComponent {

  constructor(
    public tienda: TiendaService,
    public cuenta: CuentaService
  ) {
    addIcons({
      pawOutline,
      cartOutline,
      receiptOutline,
      heartOutline,
      cubeOutline,
      timeOutline
    });
  }
}
