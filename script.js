const API_URL = 'http://localhost:3000'; // Ajusta según tu configuración


document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registroForm');
    const listaRegistros = document.getElementById('listaRegistros');
    
    // Cargar registros al iniciar
    cargarRegistros();
    
    // Manejar el envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const fecha = document.getElementById('fecha').value;
        
        if (nombre && fecha) {
            try {
                await guardarRegistro({ nombre, fecha });
                form.reset();
                cargarRegistros();
            } catch (error) {
                console.error('Error al guardar:', error);
                alert('Error al guardar el registro');
            }
        }
    });
    
    // Guardar registro en la base de datos
    async function guardarRegistro(registro) {
        const response = await fetch(`${API_URL}/registros`, {
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
    }
    
    // Cargar y mostrar registros
    async function cargarRegistros() {
        try {
            const response = await fetch(`${API_URL}/registros`);
            if (!response.ok) {
                throw new Error('Error al cargar registros');
            }
            
            const registros = await response.json();
            listaRegistros.innerHTML = '';
            
            registros.forEach(registro => {
                const li = document.createElement('li');
                
                // Formatear la fecha
                const fechaObj = new Date(registro.fecha);
                const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                li.innerHTML = `
                    <strong>${registro.nombre}</strong> - ${fechaFormateada}
                    <button onclick="eliminarRegistro(${registro.id})" class="eliminar">Eliminar</button>
                `;
                listaRegistros.appendChild(li);
            });
        } catch (error) {
            console.error('Error al cargar registros:', error);
        }
    }
});

// Función para eliminar registros
async function eliminarRegistro(id) {
    try {
        const response = await fetch(`${API_URL}/registros/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar');
        }
        
        // Recargar la lista
        document.querySelector('#listaRegistros').innerHTML = '';
        const cargarRegistros = async () => {
            // ... (la misma función de arriba)
        };
        await cargarRegistros();
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}