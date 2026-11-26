import { Router } from 'express';
import * as controlador from '../controllers/pedidos.controller.js';
import { verificarToken, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.use(verificarToken);

router.get('/mios', controlador.listarMios);

router.get('/', soloAdmin, controlador.listar);
router.get('/:id', controlador.obtener);
router.post('/', controlador.crear);
router.post('/:id/cancelar', controlador.cancelar);
router.put('/:id', soloAdmin, controlador.actualizar);
router.delete('/:id', soloAdmin, controlador.eliminar);

export default router;
