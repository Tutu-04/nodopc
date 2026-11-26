ALTER TABLE pedidos
  MODIFY estado ENUM('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  MODIFY direccion_envio VARCHAR(200) NULL,
  ADD COLUMN metodo_entrega ENUM('envio', 'retiro') NOT NULL DEFAULT 'envio' AFTER estado,
  ADD COLUMN provincia VARCHAR(60) NULL AFTER metodo_entrega,
  ADD COLUMN costo_envio DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER direccion_envio,
  ADD COLUMN medio_pago ENUM('mercadopago', 'simulado') NULL AFTER total,
  ADD COLUMN pago_id VARCHAR(100) NULL AFTER medio_pago,
  ADD COLUMN pagado_en DATETIME NULL AFTER pago_id,
  ADD COLUMN vence_en DATETIME NULL AFTER pagado_en,
  ADD CONSTRAINT chk_pedido_costo_envio CHECK (costo_envio >= 0);

UPDATE pedidos SET pagado_en = fecha WHERE estado IN ('enviado', 'entregado') AND id > 0;

CREATE INDEX idx_pedidos_vencimiento ON pedidos (estado, vence_en);
