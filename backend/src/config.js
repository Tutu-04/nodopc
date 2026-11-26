import 'dotenv/config';
import { fileURLToPath } from 'node:url';

export const config = {
  puerto: Number(process.env.PORT) || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  cookieSegura: process.env.COOKIE_SEGURA === 'true',
  minutosParaPagar: Number(process.env.MINUTOS_PARA_PAGAR) || 30,
  pagoSimulado: process.env.PAGO_SIMULADO !== 'false',
  apiPublicaUrl: process.env.API_PUBLICA_URL || '',
  mercadoPago: {
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    secretoWebhook: process.env.MP_WEBHOOK_SECRET || '',
  },
  uploadsDir: process.env.UPLOADS_DIR || fileURLToPath(new URL('../uploads', import.meta.url)),
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};

export function revisarConfiguracion() {
  if (!process.env.DB_USER) {
    return [
      'No se encontró el archivo .env en la carpeta backend.',
      'Copiá .env.example, renombrá la copia a .env y completá tus datos.',
    ];
  }
  if (!config.jwtSecret) {
    return ['Falta JWT_SECRET en el archivo .env. Sin esa clave no se pueden firmar los tokens del login.'];
  }
  return [];
}
