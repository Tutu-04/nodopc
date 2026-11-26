CREATE TABLE usuarios (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  email     VARCHAR(150) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  rol       ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
);

CREATE TABLE marcas (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  pais   VARCHAR(80)
);

CREATE TABLE productos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(150) NOT NULL,
  descripcion  TEXT,
  precio       DECIMAL(12, 2) NOT NULL,
  stock        INT NOT NULL DEFAULT 0,
  imagen_url   VARCHAR(500),
  categoria_id INT NOT NULL,
  marca_id     INT NOT NULL,
  CONSTRAINT chk_producto_precio CHECK (precio > 0),
  CONSTRAINT chk_producto_stock  CHECK (stock >= 0),
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id),
  CONSTRAINT fk_producto_marca     FOREIGN KEY (marca_id)     REFERENCES marcas (id)
);

CREATE TABLE pedidos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  fecha           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado          ENUM('pendiente', 'enviado', 'entregado') NOT NULL DEFAULT 'pendiente',
  direccion_envio VARCHAR(200) NOT NULL,
  total           DECIMAL(12, 2) NOT NULL,
  CONSTRAINT chk_pedido_total CHECK (total >= 0),
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE detalle_pedido (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id       INT NOT NULL,
  producto_id     INT NULL,
  producto_nombre VARCHAR(150) NOT NULL,
  cantidad        INT NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
  CONSTRAINT fk_detalle_pedido   FOREIGN KEY (pedido_id)   REFERENCES pedidos (id)   ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE SET NULL
);
