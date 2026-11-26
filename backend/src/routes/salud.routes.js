import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', baseDeDatos: 'ok' });
  } catch {
    res.status(503).json({ estado: 'error', baseDeDatos: 'sin conexión' });
  }
});

export default router;
