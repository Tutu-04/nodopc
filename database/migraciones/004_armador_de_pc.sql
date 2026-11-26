ALTER TABLE categorias
  ADD COLUMN componente ENUM('procesador', 'motherboard', 'memoria', 'placa_de_video', 'almacenamiento', 'fuente', 'gabinete') NULL,
  ADD CONSTRAINT uq_categorias_componente UNIQUE (componente);

ALTER TABLE productos
  ADD COLUMN especificaciones JSON NULL AFTER descripcion;

UPDATE categorias SET componente = 'procesador'     WHERE nombre = 'Procesadores'    AND id > 0;
UPDATE categorias SET componente = 'placa_de_video' WHERE nombre = 'Placas de video' AND id > 0;
UPDATE categorias SET componente = 'motherboard'    WHERE nombre = 'Motherboards'    AND id > 0;
UPDATE categorias SET componente = 'memoria'        WHERE nombre = 'Memorias RAM'    AND id > 0;
UPDATE categorias SET componente = 'almacenamiento' WHERE nombre = 'Almacenamiento'  AND id > 0;
