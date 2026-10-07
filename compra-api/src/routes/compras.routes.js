const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { obtenerCliente } = require("../services/clienteService");
const { obtenerProducto } = require("../services/productoService");

function mapCompra(fila) {
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    productoId: fila.producto_id,
    cantidad: fila.cantidad,
    total: Number(fila.total),
    fecha: fila.fecha
  };
}

// GET /compras
router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM compras ORDER BY id");
    res.status(200).json(resultado.rows.map(mapCompra));
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar compras", detalle: error.message });
  }
});

// GET /compras/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const resultado = await pool.query("SELECT * FROM compras WHERE id = $1", [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    res.status(200).json(mapCompra(resultado.rows[0]));
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar compra", detalle: error.message });
  }
});

// POST /compras
router.post("/", async (req, res) => {
  const { clienteId, productoId, cantidad } = req.body;

  if (!clienteId || !productoId || !cantidad) {
    return res.status(400).json({
      mensaje: "Los campos 'clienteId', 'productoId' y 'cantidad' son obligatorios"
    });
  }

  let cliente;
  let producto;

  try {
    cliente = await obtenerCliente(clienteId);
    producto = await obtenerProducto(productoId);
  } catch (error) {
    return res.status(503).json({
      mensaje: "No se pudo validar la compra porque uno de los servicios no respondió",
      detalle: error.message
    });
  }

  if (!cliente) {
    return res.status(404).json({ mensaje: `El cliente ${clienteId} no existe` });
  }

  if (!producto) {
    return res.status(404).json({ mensaje: `El producto ${productoId} no existe` });
  }

  if (producto.stock < cantidad) {
    return res.status(400).json({
      mensaje: `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${cantidad}`
    });
  }

  const total = Number(producto.precio) * cantidad;

  try {
    const resultado = await pool.query(
      `INSERT INTO compras (cliente_id, producto_id, cantidad, total)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [clienteId, productoId, cantidad, total]
    );
    res.status(201).json(mapCompra(resultado.rows[0]));
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear compra", detalle: error.message });
  }
});

module.exports = router;