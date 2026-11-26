import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      DB_NAME: process.env.DB_NAME_TEST || 'tienda_hardware_test',
      JWT_SECRET: process.env.JWT_SECRET || 'clave-solo-para-los-tests',
    },
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false,
    hookTimeout: 30000,
  },
});
