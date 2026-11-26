import 'dotenv/config';
import fs from 'node:fs';
import mysql from 'mysql2/promise';
import { explicarErrorMysql } from './utils/erroresMysql.js';

const rutaSql = new URL('../../database/tienda_hardware.sql', import.meta.url);

if (!process.env.DB_USER) {
  console.error('No se encontró el archivo .env en la carpeta backend.');
  console.error('Copiá .env.example, renombrá la copia a .env y completá tus datos.');
  process.exit(1);
}

try {
  const sql = fs.readFileSync(rutaSql, 'utf-8');

  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  await conexion.query(sql);
  await conexion.end();

  console.log('Base de datos "tienda_hardware" creada con los datos de prueba.');
  console.log('Ya podés arrancar el backend.');
} catch (error) {
  console.error('No se pudo crear la base de datos.');
  console.error(explicarErrorMysql(error));
  process.exit(1);
}
