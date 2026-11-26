import { Router } from 'express';
import * as controlador from '../controllers/auth.controller.js';
import { limitarLogin, limitarRegistro } from '../middlewares/limites.js';

const router = Router();

router.post('/registro', limitarRegistro, controlador.registrar);
router.post('/login', limitarLogin, controlador.iniciarSesion);

export default router;
