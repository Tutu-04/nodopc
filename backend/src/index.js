import app from './app.js';
import pool from './db.js';
import { config, revisarConfiguracion } from './config.js';
import { explicarErrorMysql } from './utils/erroresMysql.js';
import { iniciarTareas } from './tareas.js';

const problemas = revisarConfiguracion();
if (problemas.length > 0) {
  problemas.forEach((linea) => console.error(linea));
  process.exit(1);
}

app.listen(config.puerto, async () => {
  console.log(`API escuchando en http://localhost:${config.puerto}`);

  try {
    await pool.query('SELECT 1');
    console.log('Conectado a MySQL');
    iniciarTareas();
  } catch (error) {
    console.error('No se pudo conectar a MySQL.');
    console.error(explicarErrorMysql(error));
  }
});
