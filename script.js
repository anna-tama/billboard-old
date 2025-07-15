const API_URL = 'http://localhost:3000/registros';

const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;

// Now `document` exists in Node.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('Mock DOM loaded!');
});

// Objeto principal de la aplicación
const App = {
  init() {
    this.cacheElements();
    this.bindEvents();
    this.cargarRegistros();
  },

  cacheElements() {
    this.form = document.getElementById('registroForm');
    this.listaRegistros = document.getElementById('listaRegistros');
    this.nombreInput = document.getElementById('nombre');
    this.fechaInput = document.getElementById('fecha');
  },

  bindEvents() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  },

  async handleSubmit(e) {
    e.preventDefault();
    
    const registro = {
      nombre: this.nombreInput.value,
      fecha: this.fechaInput.value
    };

    if (registro.nombre && registro.fecha) {
      try {
        await this.guardarRegistro(registro);
        this.form.reset();
        await this.cargarRegistros();
      } catch (error) {
        console.error('Error al guardar:', error);
        this.mostrarError('Error al guardar el registro');
      }
    }
  },

  async guardarRegistro(registro) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registro)
    });
    
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    
    return await response.json();
  },

  async cargarRegistros() {
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error('Error al cargar registros');
      }
      
      const registros = await response.json();
      this.renderRegistros(registros);
    } catch (error) {
      console.error('Error al cargar registros:', error);
      this.mostrarError('Error al cargar los registros');
    }
  },

  renderRegistros(registros) {
    this.listaRegistros.innerHTML = registros.map(registro => `
      <li>
        <strong>${registro.nombre}</strong> - ${this.formatearFecha(registro.fecha)}
        <button data-id="${registro.id}" class="eliminar">Eliminar</button>
      </li>
    `).join('');

    // Delegación de eventos para los botones eliminar
    this.listaRegistros.addEventListener('click', (e) => {
      if (e.target.classList.contains('eliminar')) {
        this.eliminarRegistro(e.target.dataset.id);
      }
    });
  },

  formatearFecha(fechaString) {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  async eliminarRegistro(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar');
      }
      
      await this.cargarRegistros();
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.mostrarError('Error al eliminar el registro');
    }
  },

  mostrarError(mensaje) {
    // Puedes implementar un sistema de notificaciones más elegante
    alert(mensaje);
  }
};

// Inicializar la aplicación cuando el DOM esté listo
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => App.init());
}