import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import pool from './db.js';
import authRoutes from './routes/auth.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import marcasRoutes from './routes/marcas.routes.js';
import productosRoutes from './routes/productos.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { rutaNoEncontrada, manejarErrores } from './middlewares/errores.js';
import { explicarErrorMysql } from './utils/erroresMysql.js';

if (!process.env.DB_USER) {
  console.error('No se encontró el archivo .env en la carpeta backend.');
  console.error('Copiá .env.example, renombrá la copia a .env y completá tus datos.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env. Sin esa clave no se pueden firmar los tokens del login.');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

const PUERTO = process.env.PORT || 3000;

app.listen(PUERTO, async () => {
  console.log(`API escuchando en http://localhost:${PUERTO}`);

  try {
    await pool.query('SELECT 1');
    console.log('Conectado a MySQL');
  } catch (error) {
    console.error('No se pudo conectar a MySQL.');
    console.error(explicarErrorMysql(error));
  }
});
