import os from 'node:os';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      DB_NAME: process.env.DB_NAME_TEST || 'tienda_hardware_test',
      JWT_SECRET: process.env.JWT_SECRET || 'clave-solo-para-los-tests',
      UPLOADS_DIR: path.join(os.tmpdir(), 'nodopc-tests-uploads'),
    },
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    hookTimeout: 30000,
  },
});
