const express = require('express');
const app = express();

app.use(express.json());

// Rutas
const clienteRoutes = require('./routes/clienteRoutes');
app.use('/clientes', clienteRoutes);

// Para agregar más entidades en el futuro:
// const otraRoutes = require('./routes/otraRoutes');
// app.use('/otra', otraRoutes);

module.exports = app;