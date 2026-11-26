import { afterAll } from 'vitest';
import pool from '../src/db.js';
import { config } from '../src/config.js';

if (!config.db.database?.endsWith('_test')) {
  throw new Error(
    `Los tests borran la base en cada corrida y "${config.db.database}" no termina en _test. Revisá DB_NAME_TEST.`
  );
}

afterAll(async () => {
  await pool.end();
});
