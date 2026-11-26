import { Router } from 'express';
import * as controlador from '../controllers/usuarios.controller.js';
import { verificarToken, soloAdmin } from '../middlewares/auth.js';

const router = Router();

router.use(verificarToken, soloAdmin);

router.get('/', controlador.listar);
router.get('/:id', controlador.obtener);
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.eliminar);

export default router;
