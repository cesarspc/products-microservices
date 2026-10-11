const Cliente = require('../models/cliente');

// GET /libros — devuelve todos los registros
const obtenerTodos = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los clientes', detalle: error.message });
  }
};

// GET /clientes/:id — devuelve un cliente por su ID
const obtenerUno = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: `No se encontró el cliente por id ${req.params.id}` });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el cliente', detalle: error.message });
  }
};

// POST /clientes — crea un nuevo cliente
const crear = async (req, res) => {
  try {
    const { id, nombre, email } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id es obligatorio' });
    }
    if (!nombre || !email) {
      return res.status(400).json({ error: 'nombre y email son obligatorios' });
    }
    // Si ya existe un cliente con ese ID Sequelize lanzará un error de clave duplicada
    const nuevo = await Cliente.create({ id, nombre, email });
    res.status(201).json(nuevo);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: `Ya existe un cliente con el ID  ${req.body.id}` });
    }
    res.status(500).json({ error: 'Error al crear el cliente', detalle: error.message });
  }
};

// PUT /cliente/:id — actualiza los campos de un registro existente
const actualizar = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: `No se encontró el cliente con ID ${req.params.id}` });
    }
    const { nombre, email} = req.body;
    if (!nombre || !email) {
      return res.status(400).json({ error: 'nombre y email son obligatorios' });
    }
    // El ID no se actualiza: es la clave primaria y no debe cambiar
    await cliente.update({ nombre, email });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el cliente', detalle: error.message });
  }
};

// DELETE /clientes/:id — elimina un cliente por su id
const eliminar = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!libro) {
      return res.status(404).json({ error: `No se encontró el cliente con ID ${req.params.id}` });
    }
    await cliente.destroy();
    res.json({ mensaje: 'Cliente eliminado', eliminado: cliente });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el cliente', detalle: error.message });
  }
};

module.exports = { obtenerTodos, obtenerUno, crear, actualizar, eliminar };