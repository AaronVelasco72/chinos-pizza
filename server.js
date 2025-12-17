const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // Módulo nativo para manejar rutas
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- MODIFICACIÓN CLAVE: SERVIR ARCHIVOS ESTÁTICOS ---
// Esto permite que el navegador encuentre /pages/login.html, /js/auth.js, etc.
app.use(express.static(path.join(__dirname))); 

// Conexión a la BD pizza_app
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456', 
    database: 'pizza_app'
});

db.connect(err => {
    if (err) {
        console.error("Error conectando a la base de datos: " + err.message);
        return;
    }
    console.log("Conectado a la base de datos MySQL ✅");
});

// RUTA DE LOGIN: Compara con la tabla 'users'
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Intento de login para: ${email}`); // Para ver actividad en tu terminal

    const sql = "SELECT user_id, name, email FROM users WHERE email = ? AND password_hash = ?";
    
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).json({ error: err.message });
        }

        if (result.length > 0) {
            console.log(`Usuario autenticado: ${result[0].name} ✅`);
            res.json({ success: true, user: result[0] });
        } else {
            console.log("Credenciales incorrectas ❌");
            res.status(401).json({ success: false, message: "Usuario o clave incorrecta" });
        }
    });
});

// Ruta opcional para redirigir la raíz al index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
// RUTA DE REGISTRO: Guarda un nuevo usuario en la tabla 'users'
app.post('/api/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    
    // SQL para insertar los datos
    const sql = "INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [name, email, phone, password], (err, result) => {
        if (err) {
            console.error("Error al registrar:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: "El correo ya está registrado" });
            }
            return res.status(500).json({ error: err.message });
        }
        
        console.log(`Nuevo usuario registrado: ${name} ✅`);
        res.json({ success: true, message: "Usuario creado con éxito" });
    });
});
app.listen(3000, () => {
    console.log("------------------------------------------");
    console.log("Servidor Chino's Pizza listo en puerto 3000 🚀");
    console.log("Accede a: http://localhost:3000/pages/login.html");
    console.log("------------------------------------------");
});