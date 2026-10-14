const Compra = require('../models/compra');
const { obtenerCliente } = require('../services/clienteService');
const { obtenerProducto } = require('../services/productoService');

// Valida el cuerpo, consulta cliente-api y producto-api y calcula el total.
// Devuelve { status, error } si algo falla, o { datos } listos para guardar.
async function prepararCompra(body) {
  const { clienteId, productoId, cantidad } = body ?? {};

  if (!clienteId || !productoId || cantidad === undefined) {
    return { status: 400, error: 'clienteId, productoId y cantidad son obligatorios' };
  }
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return { status: 400, error: 'cantidad debe ser un entero mayor o igual a 1' };
  }

  let cliente;
  let producto;
  try {
    [cliente, producto] = await Promise.all([
      obtenerCliente(clienteId),
      obtenerProducto(productoId),
    ]);
  } catch (error) {
    return {
      status: 503,
      error: 'No se pudo validar la compra porque uno de los servicios no respondió',
      detalle: error.message,
    };
  }

  if (!cliente) {
    return { status: 404, error: `El cliente ${clienteId} no existe` };
  }
  if (!producto) {
    return { status: 404, error: `El producto ${productoId} no existe` };
  }
  if (producto.stock < cantidad) {
    return {
      status: 400,
      error: `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${cantidad}`,
    };
  }

  const total = Number(producto.precio) * cantidad;
  return { datos: { clienteId, productoId, cantidad, total } };
}

// GET /compras — devuelve todos los registros
const obtenerTodos = async (req, res) => {
  try {
    const compras = await Compra.findAll({ order: [['id', 'ASC']] });
    res.json(compras);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las compras', detalle: error.message });
  }
};

// GET /compras/:id — devuelve una compra por su ID
const obtenerUno = async (req, res) => {
  try {
    const compra = await Compra.findByPk(req.params.id);
    if (!compra) {
      return res.status(404).json({ error: `No se encontró la compra con ID ${req.params.id}` });
    }
    res.json(compra);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la compra', detalle: error.message });
  }
};

// POST /compras — crea una compra validando cliente y producto en sus APIs
const crear = async (req, res) => {
  try {
    const resultado = await prepararCompra(req.body);
    if (resultado.error) {
      const { status, ...cuerpo } = resultado;
      return res.status(status).json(cuerpo);
    }
    const nueva = await Compra.create(resultado.datos);
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la compra', detalle: error.message });
  }
};

// PUT /compras/:id — actualiza una compra y recalcula el total con el precio actual
const actualizar = async (req, res) => {
  try {
    const compra = await Compra.findByPk(req.params.id);
    if (!compra) {
      return res.status(404).json({ error: `No se encontró la compra con ID ${req.params.id}` });
    }
    const resultado = await prepararCompra(req.body);
    if (resultado.error) {
      const { status, ...cuerpo } = resultado;
      return res.status(status).json(cuerpo);
    }
    // El ID y la fecha original no se modifican
    await compra.update(resultado.datos);
    res.json(compra);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la compra', detalle: error.message });
  }
};

// DELETE /compras/:id — elimina una compra por su ID
const eliminar = async (req, res) => {
  try {
    const compra = await Compra.findByPk(req.params.id);
    if (!compra) {
      return res.status(404).json({ error: `No se encontró la compra con ID ${req.params.id}` });
    }
    await compra.destroy();
    res.json({ mensaje: 'Compra eliminada', eliminado: compra });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la compra', detalle: error.message });
  }
};

module.exports = { obtenerTodos, obtenerUno, crear, actualizar, eliminar };
