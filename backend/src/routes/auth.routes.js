import { Router } from 'express';
import * as controlador from '../controllers/auth.controller.js';
import { limitarLogin, limitarRegistro } from '../middlewares/limites.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

router.post('/registro', limitarRegistro, controlador.registrar);
router.post('/login', limitarLogin, controlador.iniciarSesion);
router.get('/yo', verificarToken, controlador.obtenerSesion);
router.post('/salir', controlador.cerrarSesion);

export default router;
