require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de la base de datos
const dbConfig = process.env.MYSQL_ADDON_URI 
    ? {
        uri: process.env.MYSQL_ADDON_URI,
        ssl: {
            rejectUnauthorized: true
        }
      }
    : {
        host: process.env.MYSQL_ADDON_HOST,
        user: process.env.MYSQL_ADDON_USER,
        password: process.env.MYSQL_ADDON_PASSWORD,
        database: process.env.MYSQL_ADDON_DB,
        port: process.env.MYSQL_ADDON_PORT,
        ssl: {
            rejectUnauthorized: true
        }
      };
// Crear conexión a la base de datos
let pool;
async function initDB() {
    pool = process.env.MYSQL_ADDON_URI 
        ? mysql.createPool(dbConfig.uri)
        : mysql.createPool(dbConfig);
    
    // Crear tabla si no existe
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS registros (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            fecha DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    await pool.query(createTableQuery);
    console.log('Tabla "registros" verificada/creada');
}

// Rutas
// Obtener todos los registros
app.get('/registros', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM registros ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener registros:', error);
        res.status(500).json({ error: 'Error al obtener registros' });
    }
});

// Crear un nuevo registro
app.post('/registros', async (req, res) => {
    const { nombre, fecha } = req.body;
    
    if (!nombre || !fecha) {
        return res.status(400).json({ error: 'Nombre y fecha son requeridos' });
    }
    
    try {
        const [result] = await pool.query(
            'INSERT INTO registros (nombre, fecha) VALUES (?, ?)',
            [nombre, fecha]
        );
        
        res.status(201).json({ id: result.insertId, nombre, fecha });
    } catch (error) {
        console.error('Error al crear registro:', error);
        res.status(500).json({ error: 'Error al crear registro' });
    }
});

// Eliminar un registro
app.delete('/registros/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await pool.query('DELETE FROM registros WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }
        
        res.json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar registro:', error);
        res.status(500).json({ error: 'Error al eliminar registro' });
    }
});

// Iniciar servidor
async function startServer() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

startServer().catch(err => {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
});