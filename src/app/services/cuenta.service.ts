import { Injectable, computed, signal } from '@angular/core';

// MODELOS

export type Especie = 'Perro' | 'Gato' | 'Conejo' | 'Ave' | 'Otra';

export interface Mascota {
  id: number;
  nombre: string;
  especie: Especie;
  raza: string;
  edad: string;
  proximaVacuna: string;
  vacunaAlDia: boolean;
}

export interface Recordatorio {
  id: number;
  icono: string;
  texto: string;
  fecha: string;
}

export type EstadoPedido =
  'Preparando' | 'En camino' | 'Entregado' | 'Cancelado';

export interface LineaPedido {
  productoId: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Pedido {
  id: number;
  fecha: string;
  estado: EstadoPedido;
  direccion: string;
  lineas: LineaPedido[];
}

/*
 * Datos de "Mi cuenta": mascotas, recordatorios y pedidos.
 * Uso signals porque la app no usa zone.js: así la vista se
 * actualiza aunque el cambio venga de un gesto, un toast o un
 * setTimeout.
 */
@Injectable({
  providedIn: 'root'
})
export class CuentaService {

  // MIS MASCOTAS

  readonly mascotas = signal<Mascota[]>([
    {
      id: 1,
      nombre: 'Max',
      especie: 'Perro',
      raza: 'Golden Retriever',
      edad: '3 años',
      proximaVacuna: '12 dic 2026',
      vacunaAlDia: true
    },
    {
      id: 2,
      nombre: 'Luna',
      especie: 'Gato',
      raza: 'Siamés',
      edad: '1 año',
      proximaVacuna: '30 nov 2026',
      vacunaAlDia: false
    },
    {
      id: 3,
      nombre: 'Coco',
      especie: 'Conejo',
      raza: 'Cabeza de león',
      edad: '2 años',
      proximaVacuna: '15 ene 2027',
      vacunaAlDia: true
    }
  ]);

  readonly vacunasPendientes = computed(() =>
    this.mascotas().filter(m => !m.vacunaAlDia).length
  );

  // RECORDATORIOS (citas que manda la veterinaria)

  private readonly citas = signal<Recordatorio[]>([
    {
      id: 101,
      icono: 'cut-outline',
      texto: 'Baño y corte para Max',
      fecha: '28 nov'
    }
  ]);

  // Lo que "llega" cada vez que el usuario sincroniza
  private citasPorLlegar: Recordatorio[] = [
    {
      id: 102,
      icono: 'medical-outline',
      texto: 'Desparasitación de Coco',
      fecha: '3 dic'
    },
    {
      id: 103,
      icono: 'fitness-outline',
      texto: 'Chequeo general de Luna',
      fecha: '10 dic'
    }
  ];

  readonly ultimaSincronizacion = signal<Date | null>(null);

  // Las vacunas pendientes también se muestran como recordatorio
  readonly recordatorios = computed<Recordatorio[]>(() => [
    ...this.mascotas()
      .filter(m => !m.vacunaAlDia)
      .map(m => ({
        id: m.id,
        icono: 'medkit-outline',
        texto: `Vacuna pendiente de ${m.nombre}`,
        fecha: m.proximaVacuna
      })),
    ...this.citas()
  ]);

  // MIS PEDIDOS

  readonly pedidos = signal<Pedido[]>([
    {
      id: 1055,
      fecha: '25 nov 2026',
      estado: 'Preparando',
      direccion: 'Calle Principal #12, Santo Domingo',
      lineas: [
        { productoId: 1, nombre: 'Croquetas Premium Perro Adulto', cantidad: 2, precio: 1450 }
      ]
    },
    {
      id: 1052,
      fecha: '23 nov 2026',
      estado: 'En camino',
      direccion: 'Calle Principal #12, Santo Domingo',
      lineas: [
        { productoId: 3, nombre: 'Collar ajustable reflectante', cantidad: 1, precio: 475 },
        { productoId: 2, nombre: 'Pelota mordedora resistente', cantidad: 1, precio: 350 }
      ]
    },
    {
      id: 1048,
      fecha: '18 nov 2026',
      estado: 'Entregado',
      direccion: 'Calle Principal #12, Santo Domingo',
      lineas: [
        { productoId: 1, nombre: 'Croquetas Premium Perro Adulto', cantidad: 1, precio: 1450 },
        { productoId: 2, nombre: 'Pelota mordedora resistente', cantidad: 2, precio: 350 }
      ]
    }
  ]);

  readonly pedidosActivos = computed(() =>
    this.pedidos().filter(
      p => p.estado === 'Preparando' || p.estado === 'En camino'
    ).length
  );

  // ---------- MASCOTAS ----------

  eliminarMascota(id: number): { mascota: Mascota; posicion: number } | null {
    const lista = this.mascotas();
    const posicion = lista.findIndex(m => m.id === id);

    if (posicion === -1) {
      return null;
    }

    const mascota = lista[posicion];
    this.mascotas.set(lista.filter(m => m.id !== id));

    return { mascota, posicion };
  }

  restaurarMascota(mascota: Mascota, posicion: number) {
    if (this.mascotas().some(m => m.id === mascota.id)) {
      return;
    }

    const lista = [...this.mascotas()];
    lista.splice(posicion, 0, mascota);
    this.mascotas.set(lista);
  }

  agregarMascota(nombre: string, especie: Especie, raza: string, edad: string) {
    const nuevoId = Math.max(0, ...this.mascotas().map(m => m.id)) + 1;

    this.mascotas.update(lista => [
      ...lista,
      {
        id: nuevoId,
        nombre,
        especie,
        raza: raza || 'Sin especificar',
        edad: edad || 'Sin especificar',
        proximaVacuna: 'Por agendar',
        vacunaAlDia: false
      }
    ]);
  }

  alternarVacuna(id: number) {
    this.mascotas.update(lista =>
      lista.map(m =>
        m.id === id ? { ...m, vacunaAlDia: !m.vacunaAlDia } : m
      )
    );
  }

  /** Simula la consulta a la veterinaria. Devuelve cuántos recordatorios nuevos llegaron. */
  sincronizarRecordatorios(): number {
    this.ultimaSincronizacion.set(new Date());

    const nueva = this.citasPorLlegar.shift();

    if (!nueva) {
      return 0;
    }

    this.citas.update(lista => [...lista, nueva]);
    return 1;
  }

  // ---------- PEDIDOS ----------

  totalPedido(pedido: Pedido): number {
    return pedido.lineas.reduce(
      (total, linea) => total + linea.precio * linea.cantidad,
      0
    );
  }

  cantidadProductos(pedido: Pedido): number {
    return pedido.lineas.reduce((total, linea) => total + linea.cantidad, 0);
  }

  cancelarPedido(id: number) {
    this.pedidos.update(lista =>
      lista.map(p =>
        p.id === id && p.estado === 'Preparando'
          ? { ...p, estado: 'Cancelado' as EstadoPedido }
          : p
      )
    );
  }
}
