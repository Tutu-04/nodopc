import pool from '../db.js';
import type { Fila } from '../tipos.js';

export interface RecuperacionVigente {
  id: number;
  usuario_id: number;
  nombre: string;
  email: string;
}

export async function crear(usuarioId: number, tokenHash: string, minutos: number): Promise<void> {
  await pool.execute(
    'INSERT INTO recuperaciones_password (usuario_id, token_hash, vence_en) VALUES (?, ?, NOW() + INTERVAL ? MINUTE)',
    [usuarioId, tokenHash, minutos]
  );
}

export async function buscarVigente(tokenHash: string): Promise<RecuperacionVigente | undefined> {
  const [filas] = await pool.execute<Fila<RecuperacionVigente>[]>(
    `SELECT r.id, r.usuario_id, u.nombre, u.email
     FROM recuperaciones_password r
     JOIN usuarios u ON u.id = r.usuario_id
     WHERE r.token_hash = ? AND r.usado_en IS NULL AND r.vence_en > NOW()`,
    [tokenHash]
  );
  return filas[0];
}

export async function anularDelUsuario(usuarioId: number): Promise<void> {
  await pool.execute('UPDATE recuperaciones_password SET usado_en = NOW() WHERE usuario_id = ? AND usado_en IS NULL', [
    usuarioId,
  ]);
}
