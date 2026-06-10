/**
 * server.js - Backend de JS Deportive Store
 * Angel De La Rosa - GA4-220501096-AA1-EV02
 */
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');
const { conectar } = require('./database');

const app    = express();
const PUERTO = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Servir el frontend desde la carpeta ../frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rutas de la API
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/pedidos',   require('./routes/pedidos'));

app.get('/api', (req, res) => res.json({ success: true, app: 'JS Deportive Store API v3.0 - MongoDB' }));

// Cualquier otra ruta carga el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// Conectar a MongoDB y luego iniciar el servidor
conectar().then(() => {
  app.listen(PUERTO, () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   JS DEPORTIVE STORE v3 - MongoDB      ║');
    console.log(`║   http://localhost:${PUERTO}               ║`);
    console.log('╚════════════════════════════════════════╝');
  });
}).catch(err => {
  console.error('Error conectando a MongoDB:', err.message);
  process.exit(1);
});

module.exports = app;
