const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Compra = sequelize.define('Compra', {
  // A diferencia de clientes y productos, el id de una compra lo genera la base
  // de datos (autoincremental): el usuario no debería inventar ids de compras.
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // clienteId y productoId apuntan a registros de OTROS microservicios, por eso
  // no hay claves foráneas: la existencia se valida llamando a cliente-api y producto-api.
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cliente_id',
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'producto_id',
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  // Postgres devuelve DECIMAL como texto; el getter lo convierte a número en el JSON.
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    get() {
      const valor = this.getDataValue('total');
      return valor === null || valor === undefined ? valor : Number(valor);
    },
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'compras',
  timestamps: true,
});

module.exports = Compra;
