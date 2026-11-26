import { Router } from 'express';
import * as controlador from '../controllers/cuenta.controller.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

router.use(verificarToken);

router.put('/', controlador.actualizarDatos);
router.put('/password', controlador.cambiarPassword);

export default router;
