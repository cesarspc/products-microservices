const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

// GET /clientes
router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM clientes ORDER BY id");
    res.status(200).json(resultado.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar clientes", detalle: error.message });
  }
});

// GET /clientes/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const resultado = await pool.query("SELECT * FROM clientes WHERE id = $1", [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar cliente", detalle: error.message });
  }
});

// POST /clientes
router.post("/", async (req, res) => {
  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res
      .status(400)
      .json({ mensaje: "Los campos 'nombre' y 'email' son obligatorios" });
  }

  try {
    const resultado = await pool.query(
      "INSERT INTO clientes (nombre, email) VALUES ($1, $2) RETURNING *",
      [nombre, email]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ mensaje: "Ya existe un cliente con ese email" });
    }
    res.status(500).json({ mensaje: "Error al crear cliente", detalle: error.message });
  }
});

module.exports = router;