SET NAMES utf8mb4;

DROP DATABASE IF EXISTS tienda_hardware;
CREATE DATABASE tienda_hardware CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tienda_hardware;

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

INSERT INTO usuarios (id, nombre, email, password, rol) VALUES
  (1, 'Administrador',     'admin@nodopc.com',   '$2b$10$irR.T.uaRBob2vfplnbTXO/ScFcKu8NzpigIhgB8Q5JumSpUHJdLS', 'admin'),
  (2, 'Cliente de Prueba', 'cliente@nodopc.com', '$2b$10$eQef1y6B8CnkD6vOGkNvZu.XPe.4oC5WwBn1wasJxBXFUSBZQ..g6', 'cliente'),
  (3, 'María Gómez',       'maria@nodopc.com',   '$2b$10$T0pa9MICgidkOeSr1vhCpOJEXpPTkJltlFuIGMGWCoOxyvLRJ8Ore', 'cliente'),
  (4, 'Lucas Fernández',    'lucas@nodopc.com',   '$2b$10$GBAIBlxz1zP5QKIWBTzlKub/W4xhSVS9CziZAXWXP6tAgnQjiURY.', 'cliente'),
  (5, 'Sofía Martínez',     'sofia@nodopc.com',   '$2b$10$xMTej6XwPDMk2VVKSgeJnuUZe5MIS8ug9RFnPPphO2.yOFpaTLNee', 'cliente'),
  (6, 'Julián Pérez',       'julian@nodopc.com',  '$2b$10$L0ks1VwGCwqEVKZ.9mtzKODG4EBmt2ZFYMh2WXE5sjtzkvPd47ATm', 'cliente'),
  (7, 'Valentina Ruiz',     'valentina@nodopc.com', '$2b$10$HZDjvWNJ9q9QcaLdanJ0PeNQNQfVNbBiF7nPA4KEwjq.7yuFUPa6a', 'cliente');

INSERT INTO categorias (id, nombre, descripcion) VALUES
  (1, 'Procesadores',    'Microprocesadores para PC de escritorio'),
  (2, 'Placas de video', 'Tarjetas gráficas'),
  (3, 'Motherboards',    'Placas madre'),
  (4, 'Memorias RAM',    'Módulos de memoria'),
  (5, 'Almacenamiento',  'Discos SSD y HDD'),
  (6, 'PC armadas',      'Equipos completos listos para usar'),
  (7, 'Monitores',       'Pantallas para oficina y gaming'),
  (8, 'Periféricos',     'Teclados, mouses y auriculares');

INSERT INTO marcas (id, nombre, pais) VALUES
  (1,  'AMD',      'Estados Unidos'),
  (2,  'Intel',    'Estados Unidos'),
  (3,  'ASUS',     'Taiwán'),
  (4,  'Gigabyte', 'Taiwán'),
  (5,  'MSI',      'Taiwán'),
  (6,  'Kingston', 'Estados Unidos'),
  (7,  'Corsair',  'Estados Unidos'),
  (8,  'Samsung',  'Corea del Sur'),
  (9,  'LG',       'Corea del Sur'),
  (10, 'Logitech', 'Suiza'),
  (11, 'Redragon', 'China'),
  (12, 'NodoPC',   'Argentina');

INSERT INTO productos (id, nombre, descripcion, precio, stock, categoria_id, marca_id) VALUES
  (1,  'Procesador AMD Ryzen 5 7600',                           '6 núcleos y 12 hilos, socket AM5. Incluye cooler.',               289999, 15, 1, 1),
  (2,  'Procesador AMD Ryzen 7 7800X3D',                        '8 núcleos y 16 hilos, socket AM5. Ideal para gaming.',            569999,  6, 1, 1),
  (3,  'Procesador Intel Core i5-14400F',                       '10 núcleos y 16 hilos, socket LGA1700. Sin gráficos integrados.', 249999, 12, 1, 2),
  (4,  'Placa de video ASUS Dual GeForce RTX 4060 8GB',         '8 GB GDDR6, dos coolers, DLSS 3.',                                499999,  8, 2, 3),
  (5,  'Placa de video Gigabyte Radeon RX 7600 Gaming OC 8GB',  '8 GB GDDR6, tres coolers.',                                       429999,  5, 2, 4),
  (6,  'Placa de video MSI GeForce RTX 4070 Super Ventus 12GB', '12 GB GDDR6X, ideal para jugar en 1440p.',                        989999,  3, 2, 5),
  (7,  'Motherboard Gigabyte B650M DS3H',                       'Socket AM5, memoria DDR5, formato Micro ATX.',                    219999, 10, 3, 4),
  (8,  'Motherboard ASUS Prime B760M-A',                        'Socket LGA1700, memoria DDR5, formato Micro ATX.',                199999,  7, 3, 3),
  (9,  'Motherboard MSI B550M PRO-VDH',                         'Socket AM4, memoria DDR4, formato Micro ATX.',                    149999,  0, 3, 5),
  (10, 'Memoria RAM Kingston Fury Beast 16GB DDR5 5600MHz',     'Un módulo de 16 GB, latencia CL36.',                               89999, 25, 4, 6),
  (11, 'Memoria RAM Corsair Vengeance 32GB (2x16GB) DDR5',      'Kit de dos módulos de 16 GB, 6000 MHz.',                          189999,  9, 4, 7),
  (12, 'SSD Kingston NV2 1TB NVMe M.2',                         'PCIe 4.0, hasta 3500 MB/s de lectura.',                            99999, 30, 5, 6),
  (13, 'SSD Samsung 990 EVO 1TB NVMe M.2',                      'PCIe 4.0, hasta 5000 MB/s de lectura.',                           149999, 14, 5, 8),
  (14, 'SSD Kingston A400 480GB SATA',                          'Formato 2.5 pulgadas, ideal para actualizar una PC vieja.',        54999, 40, 5, 6),
  (15, 'PC Armada Gamer Ryzen 5 + RTX 4060',                    'Ryzen 5 7600, 16 GB DDR5, SSD de 1 TB y RTX 4060 de 8 GB.',      1499999,  4, 6, 12),
  (16, 'PC Armada Oficina Core i5',                             'Core i5, 16 GB de RAM y SSD de 480 GB. Lista para trabajar.',     699999,  6, 6, 12),
  (17, 'Monitor LG UltraGear 24GN600 24" FHD 144Hz',            'Panel IPS, 1 ms, compatible con FreeSync.',                       279999, 11, 7, 9),
  (18, 'Monitor Samsung Odyssey G5 27" QHD 165Hz',              'Panel curvo, resolución 2560x1440.',                              449999,  5, 7, 8),
  (19, 'Monitor Gigabyte G24F 2 24" FHD 180Hz',                 'Panel IPS, 1 ms.',                                                259999,  2, 7, 4),
  (20, 'Mouse Logitech G203 Lightsync',                         '8000 DPI, luces RGB, 6 botones.',                                  39999, 35, 8, 10),
  (21, 'Auriculares Logitech G435 inalámbricos',                'Bluetooth y Lightspeed, 18 horas de batería.',                    119999, 13, 8, 10),
  (22, 'Teclado mecánico Redragon Kumara K552',                 'Formato compacto sin teclado numérico, retroiluminado.',           59999, 20, 8, 11),
  (23, 'Mouse Redragon Cobra M711',                             '10000 DPI, luces RGB, 7 botones.',                                 29999, 18, 8, 11),
  (24, 'Teclado Corsair K55 RGB Pro',                           'Teclado de membrana con 6 teclas macro.',                          79999,  9, 8, 7);

INSERT INTO pedidos (id, usuario_id, fecha, estado, direccion_envio, total) VALUES
  (1, 5, '2026-06-01 20:30:00', 'entregado', 'Rivadavia 2150, Buenos Aires', 649998),
  (2, 6, '2026-06-04 12:15:00', 'entregado', 'Sarmiento 340, Mendoza', 249999),
  (3, 6, '2026-06-21 11:00:00', 'entregado', 'Sarmiento 340, Mendoza', 429999),
  (4, 5, '2026-07-03 18:45:00', 'entregado', 'Rivadavia 2150, Buenos Aires', 219999),
  (5, 4, '2026-07-18 09:00:00', 'entregado', 'Mitre 789, San Miguel de Tucumán', 939997),
  (6, 7, '2026-07-22 10:15:00', 'entregado', 'Av. Colón 1500, Córdoba', 1949998),
  (7, 5, '2026-07-24 12:00:00', 'entregado', 'Rivadavia 2150, Buenos Aires', 769998),
  (8, 3, '2026-08-07 20:45:00', 'entregado', 'San Martín 456, Rosario', 199999),
  (9, 3, '2026-08-18 12:45:00', 'entregado', 'San Martín 456, Rosario', 589998),
  (10, 5, '2026-08-21 18:30:00', 'entregado', 'Rivadavia 2150, Buenos Aires', 1989996),
  (11, 7, '2026-08-23 21:00:00', 'entregado', 'Av. Colón 1500, Córdoba', 599998),
  (12, 4, '2026-09-06 14:30:00', 'entregado', 'Mitre 789, San Miguel de Tucumán', 729998),
  (13, 5, '2026-09-14 11:15:00', 'entregado', 'Rivadavia 2150, Buenos Aires', 1189997),
  (14, 6, '2026-09-23 21:30:00', 'entregado', 'Sarmiento 340, Mendoza', 59998),
  (15, 7, '2026-09-25 10:00:00', 'entregado', 'Av. Colón 1500, Córdoba', 569999),
  (16, 3, '2026-09-26 15:00:00', 'entregado', 'San Martín 456, Rosario', 59998),
  (17, 4, '2026-10-09 09:45:00', 'entregado', 'Mitre 789, San Miguel de Tucumán', 279998),
  (18, 7, '2026-10-12 17:00:00', 'entregado', 'Av. Colón 1500, Córdoba', 449996),
  (19, 3, '2026-10-20 15:00:00', 'entregado', 'San Martín 456, Rosario', 429999),
  (20, 2, '2026-10-20 15:30:00', 'entregado', 'Av. Belgrano 1234, Córdoba', 279997),
  (21, 6, '2026-10-26 17:30:00', 'entregado', 'Sarmiento 340, Mendoza', 279999),
  (22, 4, '2026-10-28 19:30:00', 'entregado', 'Mitre 789, San Miguel de Tucumán', 779997),
  (23, 4, '2026-11-02 09:15:00', 'pendiente', 'Mitre 789, San Miguel de Tucumán', 599996),
  (24, 2, '2026-11-02 10:15:00', 'enviado', 'Av. Belgrano 1234, Córdoba', 99998),
  (25, 4, '2026-11-04 21:30:00', 'pendiente', 'Mitre 789, San Miguel de Tucumán', 769997),
  (26, 3, '2026-11-06 19:45:00', 'pendiente', 'San Martín 456, Rosario', 509998),
  (27, 6, '2026-11-10 10:15:00', 'enviado', 'Sarmiento 340, Mendoza', 289998),
  (28, 5, '2026-11-12 10:45:00', 'pendiente', 'Rivadavia 2150, Buenos Aires', 179998);

INSERT INTO detalle_pedido (pedido_id, producto_id, producto_nombre, cantidad, precio_unitario) VALUES
  (1, 18, 'Monitor Samsung Odyssey G5 27" QHD 165Hz', 1, 449999),
  (1, 8, 'Motherboard ASUS Prime B760M-A', 1, 199999),
  (2, 3, 'Procesador Intel Core i5-14400F', 1, 249999),
  (3, 5, 'Placa de video Gigabyte Radeon RX 7600 Gaming OC 8GB', 1, 429999),
  (4, 7, 'Motherboard Gigabyte B650M DS3H', 1, 219999),
  (5, 16, 'PC Armada Oficina Core i5', 1, 699999),
  (5, 10, 'Memoria RAM Kingston Fury Beast 16GB DDR5 5600MHz', 1, 89999),
  (5, 13, 'SSD Samsung 990 EVO 1TB NVMe M.2', 1, 149999),
  (6, 18, 'Monitor Samsung Odyssey G5 27" QHD 165Hz', 1, 449999),
  (6, 15, 'PC Armada Gamer Ryzen 5 + RTX 4060', 1, 1499999),
  (7, 8, 'Motherboard ASUS Prime B760M-A', 1, 199999),
  (7, 2, 'Procesador AMD Ryzen 7 7800X3D', 1, 569999),
  (8, 8, 'Motherboard ASUS Prime B760M-A', 1, 199999),
  (9, 4, 'Placa de video ASUS Dual GeForce RTX 4060 8GB', 1, 499999),
  (9, 10, 'Memoria RAM Kingston Fury Beast 16GB DDR5 5600MHz', 1, 89999),
  (10, 15, 'PC Armada Gamer Ryzen 5 + RTX 4060', 1, 1499999),
  (10, 1, 'Procesador AMD Ryzen 5 7600', 1, 289999),
  (10, 12, 'SSD Kingston NV2 1TB NVMe M.2', 2, 99999),
  (11, 18, 'Monitor Samsung Odyssey G5 27" QHD 165Hz', 1, 449999),
  (11, 13, 'SSD Samsung 990 EVO 1TB NVMe M.2', 1, 149999),
  (12, 23, 'Mouse Redragon Cobra M711', 1, 29999),
  (12, 16, 'PC Armada Oficina Core i5', 1, 699999),
  (13, 4, 'Placa de video ASUS Dual GeForce RTX 4060 8GB', 2, 499999),
  (13, 11, 'Memoria RAM Corsair Vengeance 32GB (2x16GB) DDR5', 1, 189999),
  (14, 23, 'Mouse Redragon Cobra M711', 2, 29999),
  (15, 2, 'Procesador AMD Ryzen 7 7800X3D', 1, 569999),
  (16, 23, 'Mouse Redragon Cobra M711', 2, 29999),
  (17, 7, 'Motherboard Gigabyte B650M DS3H', 1, 219999),
  (17, 22, 'Teclado mecánico Redragon Kumara K552', 1, 59999),
  (18, 13, 'SSD Samsung 990 EVO 1TB NVMe M.2', 1, 149999),
  (18, 21, 'Auriculares Logitech G435 inalámbricos', 1, 119999),
  (18, 10, 'Memoria RAM Kingston Fury Beast 16GB DDR5 5600MHz', 2, 89999),
  (19, 5, 'Placa de video Gigabyte Radeon RX 7600 Gaming OC 8GB', 1, 429999),
  (20, 12, 'SSD Kingston NV2 1TB NVMe M.2', 1, 99999),
  (20, 10, 'Memoria RAM Kingston Fury Beast 16GB DDR5 5600MHz', 2, 89999),
  (21, 17, 'Monitor LG UltraGear 24GN600 24" FHD 144Hz', 1, 279999),
  (22, 20, 'Mouse Logitech G203 Lightsync', 2, 39999),
  (22, 16, 'PC Armada Oficina Core i5', 1, 699999),
  (23, 22, 'Teclado mecánico Redragon Kumara K552', 2, 59999),
  (23, 17, 'Monitor LG UltraGear 24GN600 24" FHD 144Hz', 1, 279999),
  (23, 8, 'Motherboard ASUS Prime B760M-A', 1, 199999),
  (24, 20, 'Mouse Logitech G203 Lightsync', 1, 39999),
  (24, 22, 'Teclado mecánico Redragon Kumara K552', 1, 59999),
  (25, 2, 'Procesador AMD Ryzen 7 7800X3D', 1, 569999),
  (25, 12, 'SSD Kingston NV2 1TB NVMe M.2', 2, 99999),
  (26, 1, 'Procesador AMD Ryzen 5 7600', 1, 289999),
  (26, 7, 'Motherboard Gigabyte B650M DS3H', 1, 219999),
  (27, 20, 'Mouse Logitech G203 Lightsync', 1, 39999),
  (27, 3, 'Procesador Intel Core i5-14400F', 1, 249999),
  (28, 10, 'Memoria RAM Kingston Fury Beast 16GB DDR5 5600MHz', 2, 89999);
