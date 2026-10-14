-- Datos iniciales de la base compartida por las 3 APIs.
--
-- Postgres ejecuta este archivo automáticamente SOLO la primera vez que arranca
-- con el volumen vacío (carpeta /docker-entrypoint-initdb.d). Las tablas se
-- definen igual que las crearía Sequelize, para que el sync({ alter: true })
-- de cada API las encuentre ya listas. Es idempotente: se puede ejecutar varias
-- veces sin duplicar datos.

-- ---------- Tablas ----------

CREATE TABLE IF NOT EXISTS clientes (
  id          INTEGER      PRIMARY KEY,
  nombre      VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
  id          INTEGER       PRIMARY KEY,
  nombre      VARCHAR(255)  NOT NULL,
  precio      DECIMAL(12,2) NOT NULL,
  stock       INTEGER       NOT NULL,
  "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compras (
  id          SERIAL        PRIMARY KEY,
  cliente_id  INTEGER       NOT NULL,
  producto_id INTEGER       NOT NULL,
  cantidad    INTEGER       NOT NULL,
  total       DECIMAL(12,2) NOT NULL,
  fecha       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---------- Clientes ----------

-- createdAt/updatedAt se envían explícitamente: si la tabla la creó Sequelize
-- esas columnas no tienen DEFAULT en la base (Sequelize las rellena en Node).
INSERT INTO clientes (id, nombre, email, "createdAt", "updatedAt") VALUES
  (1, 'Xiomara', 'xiomara@example.com', NOW(), NOW()),
  (2, 'César',   'cesar@example.com',   NOW(), NOW()),
  (3, 'Carlos',  'carlos@example.com',  NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ---------- Productos ----------

INSERT INTO productos (id, nombre, precio, stock, "createdAt", "updatedAt") VALUES
  (1, 'Teclado mecánico',    180000, 15, NOW(), NOW()),
  (2, 'Mouse inalámbrico',    65000, 30, NOW(), NOW()),
  (3, 'Monitor 24 pulgadas', 750000,  8, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ---------- Compras ----------
-- total = precio del producto * cantidad

INSERT INTO compras (id, cliente_id, producto_id, cantidad, total, fecha, "createdAt", "updatedAt") VALUES
  (1, 1, 1, 1, 180000, NOW(), NOW(), NOW()),  -- Xiomara: 1 teclado
  (2, 2, 2, 2, 130000, NOW(), NOW(), NOW()),  -- César:   2 mouse
  (3, 3, 3, 1, 750000, NOW(), NOW(), NOW())   -- Carlos:  1 monitor
ON CONFLICT (id) DO NOTHING;

-- Como insertamos ids a mano, movemos el contador del SERIAL para que la
-- próxima compra creada desde la API reciba el id 4 (y no choque con el 1).
SELECT setval(pg_get_serial_sequence('compras', 'id'), (SELECT MAX(id) FROM compras));
