
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
  IonMenuToggle
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  pawOutline,
  cartOutline,
  receiptOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  imports: [
    RouterLink,
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
    IonMenuToggle
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
  `]
})
export class AppComponent {

  constructor() {
    addIcons({
      pawOutline,
      cartOutline,
      receiptOutline
    });
  }
}
