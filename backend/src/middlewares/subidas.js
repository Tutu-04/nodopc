import multer from 'multer';
import { TAMANO_MAXIMO } from '../utils/imagenes.js';

export const recibirImagen = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANO_MAXIMO, files: 1 },
}).single('imagen');
