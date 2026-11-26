import { Router } from 'express';
import * as controlador from '../controllers/auth.controller.js';

const router = Router();

router.post('/registro', controlador.registrar);
router.post('/login', controlador.iniciarSesion);

export default router;
