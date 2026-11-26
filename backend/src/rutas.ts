import fs from 'node:fs';
import path from 'node:path';

function buscarCarpetaDatabase(desde: string): string {
  let carpeta = desde;
  for (let nivel = 0; nivel < 5; nivel++) {
    const candidata = path.join(carpeta, 'database');
    if (fs.existsSync(path.join(candidata, 'migraciones'))) return candidata;
    carpeta = path.dirname(carpeta);
  }
  throw new Error(`No se encontró la carpeta database/migraciones cerca de ${desde}`);
}

export const carpetaDatabase = process.env.DATABASE_DIR ?? buscarCarpetaDatabase(import.meta.dirname);
export const carpetaMigraciones = path.join(carpetaDatabase, 'migraciones');
export const archivoDatosDePrueba = path.join(carpetaDatabase, 'semillas', 'datos_prueba.sql');
