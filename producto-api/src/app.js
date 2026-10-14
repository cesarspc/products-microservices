const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'producto-api activa' });
});

// Rutas
const productoRoutes = require('./routes/productoRoutes');
app.use('/productos', productoRoutes);

module.exports = app;
