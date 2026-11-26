import pool from '../db.js';

export async function crear(usuarioId, tokenHash, minutos) {
  await pool.execute(
    'INSERT INTO recuperaciones_password (usuario_id, token_hash, vence_en) VALUES (?, ?, NOW() + INTERVAL ? MINUTE)',
    [usuarioId, tokenHash, minutos]
  );
}

export async function buscarVigente(tokenHash) {
  const [filas] = await pool.execute(
    `SELECT r.id, r.usuario_id, u.nombre, u.email
     FROM recuperaciones_password r
     JOIN usuarios u ON u.id = r.usuario_id
     WHERE r.token_hash = ? AND r.usado_en IS NULL AND r.vence_en > NOW()`,
    [tokenHash]
  );
  return filas[0];
}

export async function anularDelUsuario(usuarioId) {
  await pool.execute('UPDATE recuperaciones_password SET usado_en = NOW() WHERE usuario_id = ? AND usado_en IS NULL', [
    usuarioId,
  ]);
}
