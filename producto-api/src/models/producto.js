const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  // id es la clave primaria y la proporciona el usuario al crear el producto
  // (mismo criterio que cliente-api). Sequelize NO generará un id automático.
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // DECIMAL evita errores de redondeo con dinero. Postgres lo devuelve como
  // texto ("180000.00"), por eso el getter lo convierte a número en el JSON.
  precio: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 },
    get() {
      const valor = this.getDataValue('precio');
      return valor === null || valor === undefined ? valor : Number(valor);
    },
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0 },
  },
}, {
  tableName: 'productos',
  timestamps: true,
});

module.exports = Producto;
