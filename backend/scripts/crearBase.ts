import { config, revisarConfiguracion } from '../src/config.js';
import { reiniciarBase } from '../src/migraciones.js';
import { explicarErrorMysql } from '../src/utils/erroresMysql.js';

const problemas = revisarConfiguracion();
if (problemas.length > 0) {
  problemas.forEach((linea) => console.error(linea));
  process.exit(1);
}

try {
  await reiniciarBase();
  console.log(`Base de datos "${config.db.database}" creada con los datos de prueba.`);
  console.log('Ya podés arrancar el backend.');
} catch (error) {
  console.error('No se pudo crear la base de datos.');
  console.error(explicarErrorMysql(error as Error));
  process.exit(1);
}
