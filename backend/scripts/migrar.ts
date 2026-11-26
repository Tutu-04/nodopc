import { config, revisarConfiguracion } from '../src/config.js';
import { crearBase, aplicarMigraciones } from '../src/migraciones.js';
import { explicarErrorMysql } from '../src/utils/erroresMysql.js';

const problemas = revisarConfiguracion();
if (problemas.length > 0) {
  problemas.forEach((linea) => console.error(linea));
  process.exit(1);
}

try {
  await crearBase();
  const aplicadas = await aplicarMigraciones();

  if (aplicadas.length === 0) {
    console.log(`La base "${config.db.database}" ya está al día.`);
  } else {
    aplicadas.forEach((archivo) => console.log(`Migración aplicada: ${archivo}`));
  }
} catch (error) {
  console.error('No se pudieron aplicar las migraciones.');
  console.error(explicarErrorMysql(error as Error));
  process.exit(1);
}
