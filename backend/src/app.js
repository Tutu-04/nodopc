import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import marcasRoutes from './routes/marcas.routes.js';
import productosRoutes from './routes/productos.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import saludRoutes from './routes/salud.routes.js';
import cuentaRoutes from './routes/cuenta.routes.js';
import enviosRoutes from './routes/envios.routes.js';
import pagosRoutes from './routes/pagos.routes.js';
import { rutaNoEncontrada, manejarErrores } from './middlewares/errores.js';
import { config } from './config.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});

app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(config.uploadsDir, { maxAge: '7d' })
);

app.use('/api/salud', saludRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cuenta', cuentaRoutes);
app.use('/api/envios', enviosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
