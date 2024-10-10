import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})

export class ActivityPage {

  // Arreglo para almacenar las actividades que el usuario agrega
  listaActividades: Actividad[] = [];
  private almacenamiento: Storage | null = null; // Objeto de almacenamiento que se inicializa más tarde

  constructor(private alertController: AlertController, private storage: Storage) {
    // Inicializa el almacenamiento al crear la página
    this.inicializarAlmacenamiento();
  }

  // Inicializa el almacenamiento de la aplicación y carga las actividades guardadas previamente
  async inicializarAlmacenamiento() {
    this.almacenamiento = await this.storage.create(); // Crea o accede al sistema de almacenamiento
    this.cargarActividades(); // Carga las actividades guardadas al iniciar
  }

  // Carga las actividades previamente almacenadas en el sistema de almacenamiento
  async cargarActividades() {
    const actividadesGuardadas = await this.storage.get('listaActividades'); // Recupera las actividades guardadas
    if (actividadesGuardadas) {
      this.listaActividades = actividadesGuardadas; // Si hay actividades guardadas, se asignan al arreglo
    }
  }

  // Guarda el estado actual de la lista de actividades en el almacenamiento local
  async guardarActividades() {
    await this.storage.set('listaActividades', this.listaActividades); // Almacena la lista actualizada en el almacenamiento
  }

  // Muestra una alerta para que el usuario agregue una nueva actividad y la guarda en la lista
  async agregarActividad() {
    const alerta = await this.alertController.create({
      header: 'Nueva Actividad', // Título de la alerta
      inputs: [
        { name: 'tipo', type: 'text', placeholder: 'Tipo de Actividad (Ej. Correr)' }, // Campo para tipo de actividad
        { name: 'duracion', type: 'number', placeholder: 'Duración (minutos)' }, // Campo para la duración en minutos
        { name: 'fecha', type: 'date', placeholder: 'Fecha de la actividad' } // Campo para seleccionar la fecha
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' }, // Botón para cancelar la acción
        {
          text: 'Añadir',
          handler: (data) => {
            // Añade la actividad ingresada por el usuario al arreglo listaActividades
            this.listaActividades.push({
              tipo: data.tipo,
              duracion: data.duracion,
              fecha: new Date(data.fecha) // Convierte la fecha ingresada en objeto Date
            });
            this.guardarActividades(); // Guarda el estado actualizado
          }
        }
      ]
    });
    await alerta.present(); // Presenta la alerta
  }

  // Muestra una alerta para que el usuario edite los detalles de una actividad existente
  async modificarActividad(actividad: Actividad) {
    const alerta = await this.alertController.create({
      header: 'Editar Actividad', // Título de la alerta
      inputs: [
        { name: 'tipo', type: 'text', value: actividad.tipo, placeholder: 'Tipo de Actividad' }, // Campo para tipo con valor existente
        { name: 'duracion', type: 'number', value: actividad.duracion, placeholder: 'Duración (minutos)' }, // Campo para duración con valor existente
        { name: 'fecha', type: 'date', value: this.convertirFecha(actividad.fecha), placeholder: 'Fecha de la Actividad' } // Campo para fecha con valor existente
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' }, // Botón para cancelar la acción
        {
          text: 'Guardar',
          handler: (data) => {
            // Actualiza la actividad existente con los nuevos valores ingresados
            actividad.tipo = data.tipo;
            actividad.duracion = data.duracion;
            actividad.fecha = new Date(data.fecha); // Convierte la fecha ingresada en objeto Date
            this.guardarActividades(); // Guarda el estado actualizado
          }
        }
      ]
    });
    await alerta.present(); // Presenta la alerta
  }

  // Muestra una alerta de confirmación para eliminar una actividad
  async eliminarActividad(actividad: Actividad) {
    const alerta = await this.alertController.create({
      header: 'Confirmar Eliminación', // Título de la alerta
      message: `¿Deseas eliminar la actividad "${actividad.tipo}"?`, // Mensaje de confirmación
      buttons: [
        { text: 'Cancelar', role: 'cancel' }, // Botón para cancelar la acción
        {
          text: 'Eliminar',
          handler: () => {
            // Filtra y elimina la actividad seleccionada de la lista
            this.listaActividades = this.listaActividades.filter(a => a !== actividad);
            this.guardarActividades(); // Guarda el estado actualizado
          }
        }
      ]
    });
    await alerta.present(); // Presenta la alerta
  }

  // Convierte una fecha en un formato 'YYYY-MM-DD' aceptable para un input de tipo 'date'
  convertirFecha(fecha: Date): string {
    const dateObj = new Date(fecha); // Asegura que la fecha es un objeto Date
    const mes = '' + (dateObj.getMonth() + 1); // Obtiene el mes y agrega 1 porque los meses en JS son de 0 a 11
    const dia = '' + dateObj.getDate(); // Obtiene el día del mes
    const año = dateObj.getFullYear(); // Obtiene el año
    // Devuelve la fecha en el formato 'YYYY-MM-DD'
    return [año, mes.padStart(2, '0'), dia.padStart(2, '0')].join('-');
  }
}

// Interfaz que define la estructura de una Actividad
interface Actividad {
  tipo: string; // Tipo de actividad (ej: correr, nadar)
  duracion: number; // Duración de la actividad en minutos
  fecha: Date; // Fecha en la que se realizó la actividad
}