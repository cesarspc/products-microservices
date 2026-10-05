const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

// GET /productos
router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM productos ORDER BY id");
    res.status(200).json(resultado.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar productos", detalle: error.message });
  }
});

// GET /productos/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const resultado = await pool.query("SELECT * FROM productos WHERE id = $1", [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar producto", detalle: error.message });
  }
});

// POST /productos
router.post("/", async (req, res) => {
  const { nombre, precio, stock } = req.body;

  if (!nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({
      mensaje: "Los campos 'nombre', 'precio' y 'stock' son obligatorios"
    });
  }

  try {
    const resultado = await pool.query(
      "INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3) RETURNING *",
      [nombre, precio, stock]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear producto", detalle: error.message });
  }
});

module.exports = router;