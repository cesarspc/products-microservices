const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  // isbn es la clave primaria y la proporciona el usuario al crear el libro.
  // Sequelize NO generará un id automático porque definimos la primaryKey aquí.
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'clientes',
  timestamps: true,
});

module.exports = Cliente;