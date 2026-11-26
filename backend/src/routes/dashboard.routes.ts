import { Router } from 'express';
import * as controlador from '../controllers/dashboard.controller.js';
import { verificarToken, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', verificarToken, soloAdmin, controlador.resumen);

export default router;
