import { Router } from 'express';
import * as controlador from '../controllers/productos.controller.js';
import { verificarToken, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', controlador.listar);
router.get('/mas-vendidos', controlador.masVendidos);
router.get('/:id', controlador.obtener);

router.post('/', verificarToken, soloAdmin, controlador.crear);
router.put('/:id', verificarToken, soloAdmin, controlador.actualizar);
router.delete('/:id', verificarToken, soloAdmin, controlador.eliminar);

export default router;
