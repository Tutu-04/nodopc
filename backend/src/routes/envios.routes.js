import { Router } from 'express';
import { ENVIO_GRATIS_DESDE, PROVINCIAS } from '../utils/envios.js';
import { config } from '../config.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    provincias: PROVINCIAS,
    envioGratisDesde: ENVIO_GRATIS_DESDE,
    minutosParaPagar: config.minutosParaPagar,
  });
});

export default router;
