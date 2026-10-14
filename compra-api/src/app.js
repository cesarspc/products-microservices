const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'compra-api activa' });
});

// Rutas
const compraRoutes = require('./routes/compraRoutes');
app.use('/compras', compraRoutes);

module.exports = app;
