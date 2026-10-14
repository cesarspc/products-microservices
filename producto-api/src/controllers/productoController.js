const Producto = require('../models/producto');

// Valida los campos editables de un producto. Devuelve un mensaje de error o null.
function validarCampos({ nombre, precio, stock }) {
  if (!nombre || precio === undefined || stock === undefined) {
    return 'nombre, precio y stock son obligatorios';
  }
  if (typeof precio !== 'number' || precio < 0) {
    return 'precio debe ser un número mayor o igual a 0';
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return 'stock debe ser un entero mayor o igual a 0';
  }
  return null;
}

// GET /productos — devuelve todos los registros
const obtenerTodos = async (req, res) => {
  try {
    const productos = await Producto.findAll({ order: [['id', 'ASC']] });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos', detalle: error.message });
  }
};

// GET /productos/:id — devuelve un producto por su ID
const obtenerUno = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: `No se encontró el producto con ID ${req.params.id}` });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto', detalle: error.message });
  }
};

// POST /productos — crea un nuevo producto
const crear = async (req, res) => {
  try {
    const { id, nombre, precio, stock } = req.body ?? {};
    if (!id) {
      return res.status(400).json({ error: 'id es obligatorio' });
    }
    const errorValidacion = validarCampos({ nombre, precio, stock });
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }
    // Si ya existe un producto con ese ID Sequelize lanzará un error de clave duplicada
    const nuevo = await Producto.create({ id, nombre, precio, stock });
    res.status(201).json(nuevo);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: `Ya existe un producto con el ID ${req.body.id}` });
    }
    res.status(500).json({ error: 'Error al crear el producto', detalle: error.message });
  }
};

// PUT /productos/:id — actualiza los campos de un registro existente
const actualizar = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: `No se encontró el producto con ID ${req.params.id}` });
    }
    const { nombre, precio, stock } = req.body ?? {};
    const errorValidacion = validarCampos({ nombre, precio, stock });
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }
    // El ID no se actualiza: es la clave primaria y no debe cambiar
    await producto.update({ nombre, precio, stock });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto', detalle: error.message });
  }
};

// DELETE /productos/:id — elimina un producto por su ID
const eliminar = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: `No se encontró el producto con ID ${req.params.id}` });
    }
    await producto.destroy();
    res.json({ mensaje: 'Producto eliminado', eliminado: producto });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto', detalle: error.message });
  }
};

module.exports = { obtenerTodos, obtenerUno, crear, actualizar, eliminar };
