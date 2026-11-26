import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';
import path from 'node:path';
import { config } from './config.js';
import { archivoDatosDePrueba, carpetaMigraciones } from './rutas.js';

function conectar({ conBase = true } = {}) {
  return mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: conBase ? config.db.database : undefined,
    multipleStatements: true,
  });
}

export async function crearBase({ borrarAntes = false } = {}) {
  const conexion = await conectar({ conBase: false });
  const nombre = mysql.escapeId(config.db.database);
  try {
    if (borrarAntes) {
      await conexion.query(`DROP DATABASE IF EXISTS ${nombre}`);
    }
    await conexion.query(`CREATE DATABASE IF NOT EXISTS ${nombre} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } finally {
    await conexion.end();
  }
}

export async function aplicarMigraciones() {
  const conexion = await conectar();
  try {
    await conexion.query(
      `CREATE TABLE IF NOT EXISTS migraciones (
        nombre      VARCHAR(200) PRIMARY KEY,
        aplicada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    );

    const [filas] = await conexion.query('SELECT nombre FROM migraciones');
    const yaAplicadas = new Set(filas.map((fila) => fila.nombre));

    const archivos = (await fs.readdir(carpetaMigraciones)).filter((archivo) => archivo.endsWith('.sql')).sort();

    const aplicadasAhora = [];
    for (const archivo of archivos) {
      if (yaAplicadas.has(archivo)) continue;

      const sql = await fs.readFile(path.join(carpetaMigraciones, archivo), 'utf-8');
      await conexion.query(sql);
      await conexion.query('INSERT INTO migraciones (nombre) VALUES (?)', [archivo]);
      aplicadasAhora.push(archivo);
    }

    return aplicadasAhora;
  } finally {
    await conexion.end();
  }
}

export async function cargarDatosDePrueba() {
  const conexion = await conectar();
  try {
    const sql = await fs.readFile(archivoDatosDePrueba, 'utf-8');
    await conexion.query(sql);
  } finally {
    await conexion.end();
  }
}

export async function estaVacia() {
  const conexion = await conectar();
  try {
    const [filas] = await conexion.query('SELECT COUNT(*) AS cantidad FROM usuarios');
    return filas[0].cantidad === 0;
  } finally {
    await conexion.end();
  }
}

export async function reiniciarBase() {
  await crearBase({ borrarAntes: true });
  await aplicarMigraciones();
  await cargarDatosDePrueba();
}
