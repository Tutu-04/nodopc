import { Router } from 'express';
import * as controlador from '../controllers/pagos.controller.js';
import { verificarToken } from '../middlewares/auth.js';
import { limitarPagos } from '../middlewares/limites.js';

const router = Router();

router.get('/medios', controlador.listarMedios);

router.post('/:pedidoId/simulado', verificarToken, limitarPagos, controlador.pagarSimulado);
router.post('/:pedidoId/mercadopago', verificarToken, controlador.pagarConMercadoPago);
router.post('/:pedidoId/verificar', verificarToken, controlador.verificarMercadoPago);

export default router;
