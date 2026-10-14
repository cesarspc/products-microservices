require('dotenv').config();

const app       = require('./src/app');
const sequelize = require('./src/config/database');

const PORT = process.env.PORT || 3003;

async function iniciar() {
  try {
    // 1. Verifica que la conexión a PostgreSQL funciona
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // 2. Sincroniza los modelos con la base de datos (crea/altera la tabla sin borrar datos)
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos.');

    // 3. Arranca el servidor HTTP
    app.listen(PORT, () => {
      console.log(`compra-api corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    // Sale con error para que Docker (restart: unless-stopped) reintente
    process.exit(1);
  }
}

iniciar();
