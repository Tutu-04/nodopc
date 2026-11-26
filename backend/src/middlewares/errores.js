import multer from 'multer';

export function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

export function manejarErrores(err, req, res, next) {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'La imagen no puede pesar más de 2 MB' });
    }
    return res.status(400).json({ error: 'Mandá una sola imagen en el campo "imagen"' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El JSON enviado no es válido' });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con ese nombre o email' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ error: 'No se puede eliminar porque tiene registros asociados' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'La categoría, la marca o el producto indicado no existe' });
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.code === 'ER_CONSTRAINT_FAILED') {
    return res
      .status(400)
      .json({ error: 'Algún dato no cumple las restricciones de la base (por ejemplo, stock negativo)' });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
