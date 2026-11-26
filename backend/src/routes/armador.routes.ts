import { Router } from 'express';
import * as controlador from '../controllers/armador.controller.js';

const router = Router();

router.get('/', controlador.obtenerOpciones);
router.get('/campos', controlador.obtenerCampos);
router.post('/verificar', controlador.verificar);

export default router;
