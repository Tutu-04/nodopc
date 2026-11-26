import { config } from '../config.js';

export function explicarErrorMysql(error) {
  const servidor = `${config.db.host}:${config.db.port}`;

  switch (error.code) {
    case 'ECONNREFUSED':
      return `MySQL no está encendido en ${servidor}. Prendelo (XAMPP: botón Start de MySQL) o revisá DB_HOST y DB_PORT en el .env.`;
    case 'ER_ACCESS_DENIED_ERROR':
      return `MySQL rechazó el usuario o la contraseña. Revisá DB_USER y DB_PASSWORD en el .env (con XAMPP la contraseña va vacía). Detalle: ${error.message}`;
    case 'ER_BAD_DB_ERROR':
      return `La base ${config.db.database} todavía no existe. Creala con:  npm run crear-base`;
    case 'ENOENT':
      return 'No se encontraron los archivos de la carpeta database. Revisá que el proyecto esté completo.';
    default:
      return `${error.code ?? ''} ${error.message}`.trim();
  }
}
