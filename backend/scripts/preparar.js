import { config, revisarConfiguracion } from '../src/config.js';
import { aplicarMigraciones, cargarDatosDePrueba, crearBase, estaVacia } from '../src/migraciones.js';
import { explicarErrorMysql } from '../src/utils/erroresMysql.js';

const problemas = revisarConfiguracion();
if (problemas.length > 0) {
  problemas.forEach((linea) => console.error(linea));
  process.exit(1);
}

try {
  await crearBase();
  const aplicadas = await aplicarMigraciones();
  aplicadas.forEach((archivo) => console.log(`Migración aplicada: ${archivo}`));

  if (await estaVacia()) {
    await cargarDatosDePrueba();
    console.log(`Datos de prueba cargados en "${config.db.database}".`);
  } else {
    console.log(`La base "${config.db.database}" ya tiene datos: no se tocaron.`);
  }
} catch (error) {
  console.error('No se pudo preparar la base de datos.');
  console.error(explicarErrorMysql(error));
  process.exit(1);
}
