import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

interface ErrorDeLaApi extends Error {
  status?: number;
  code?: string;
  type?: string;
}

export function rutaNoEncontrada(req: Request, res: Response): void {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

export function manejarErrores(err: ErrorDeLaApi, req: Request, res: Response, next: NextFunction): void {
  if (err.status) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'La imagen no puede pesar más de 2 MB' });
      return;
    }
    res.status(400).json({ error: 'Mandá una sola imagen en el campo "imagen"' });
    return;
  }

  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'El JSON enviado no es válido' });
    return;
  }

  if (err.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'Ya existe un registro con ese nombre o email' });
    return;
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    res.status(409).json({ error: 'No se puede eliminar porque tiene registros asociados' });
    return;
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    res.status(400).json({ error: 'La categoría, la marca o el producto indicado no existe' });
    return;
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.code === 'ER_CONSTRAINT_FAILED') {
    res.status(400).json({ error: 'Algún dato no cumple las restricciones de la base (por ejemplo, stock negativo)' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
