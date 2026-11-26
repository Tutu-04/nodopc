INSERT INTO usuarios (id, nombre, email, password, rol) VALUES
  (1, 'Administrador',     'admin@nodopc.com',   '$2b$10$irR.T.uaRBob2vfplnbTXO/ScFcKu8NzpigIhgB8Q5JumSpUHJdLS', 'admin'),
  (2, 'Cliente de Prueba', 'cliente@nodopc.com', '$2b$10$eQef1y6B8CnkD6vOGkNvZu.XPe.4oC5WwBn1wasJxBXFUSBZQ..g6', 'cliente'),
  (3, 'María Gómez',       'maria@nodopc.com',   '$2b$10$T0pa9MICgidkOeSr1vhCpOJEXpPTkJltlFuIGMGWCoOxyvLRJ8Ore', 'cliente'),
  (4, 'Lucas Fernández',    'lucas@nodopc.com',   '$2b$10$GBAIBlxz1zP5QKIWBTzlKub/W4xhSVS9CziZAXWXP6tAgnQjiURY.', 'cliente'),
  (5, 'Sofía Martínez',     'sofia@nodopc.com',   '$2b$10$xMTej6XwPDMk2VVKSgeJnuUZe5MIS8ug9RFnPPphO2.yOFpaTLNee', 'cliente'),
  (6, 'Julián Pérez',       'julian@nodopc.com',  '$2b$10$L0ks1VwGCwqEVKZ.9mtzKODG4EBmt2ZFYMh2WXE5sjtzkvPd47ATm', 'cliente'),
  (7, 'Valentina Ruiz',     'valentina@nodopc.com', '$2b$10$HZDjvWNJ9q9QcaLdanJ0PeNQNQfVNbBiF7nPA4KEwjq.7yuFUPa6a', 'cliente');

INSERT INTO categorias (id, nombre, descripcion, componente) VALUES
  (1,  'Procesadores',    'Microprocesadores para PC de escritorio', 'procesador'),
  (2,  'Placas de video', 'Tarjetas gráficas',                       'placa_de_video'),
  (3,  'Motherboards',    'Placas madre',                            'motherboard'),
  (4,  'Memorias RAM',    'Módulos de memoria',                      'memoria'),
  (5,  'Almacenamiento',  'Discos SSD y HDD',                        'almacenamiento'),
  (6,  'PC armadas',      'Equipos completos listos para usar',      NULL),
  (7,  'Monitores',       'Pantallas para oficina y gaming',         NULL),
  (8,  'Periféricos',     'Teclados, mouses y auriculares',          NULL),
  (9,  'Fuentes',         'Fuentes de alimentación',                 'fuente'),
  (10, 'Gabinetes',       'Gabinetes para PC de escritorio',         'gabinete');

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
  (24, 'Teclado Corsair K55 RGB Pro',                           'Teclado de membrana con 6 teclas macro.',                          79999,  9, 8, 7),
  (25, 'Procesador AMD Ryzen 5 5600',                           '6 núcleos y 12 hilos, socket AM4. Incluye cooler.',                         179999, 12, 1,  1),
  (26, 'Procesador Intel Core i7-14700K',                       '20 núcleos y 28 hilos, socket LGA1700. Con gráficos integrados, sin cooler.', 619999, 6,  1,  2),
  (27, 'Memoria RAM Kingston Fury Beast 16GB DDR4 3200MHz',     'Un módulo de 16 GB, latencia CL16.',                                        59999,  20, 4,  6),
  (28, 'Motherboard MSI MAG B650 Tomahawk WiFi',                'Socket AM5, memoria DDR5, formato ATX y WiFi 6E.',                          349999, 6,  3,  5),
  (29, 'Fuente Gigabyte P450B 450W 80 Plus Bronze',             'Fuente de 450 W con certificación 80 Plus Bronze.',                         69999,  15, 9,  4),
  (30, 'Fuente Corsair CX650 650W 80 Plus Bronze',              'Fuente de 650 W con ventilador silencioso de 120 mm.',                      109999, 12, 9,  7),
  (31, 'Fuente MSI MAG A850GL 850W 80 Plus Gold',               'Fuente modular de 850 W, lista para PCIe 5.0.',                             179999, 8,  9,  5),
  (32, 'Gabinete Corsair 4000D Airflow',                        'Formato ATX, frente mallado y dos ventiladores incluidos.',                 149999, 10, 10, 7),
  (33, 'Gabinete NodoPC Compact M1',                            'Gabinete Micro ATX con vidrio templado y tres ventiladores.',               79999,  14, 10, 12);

UPDATE productos SET especificaciones = '{"socket": "AM5", "consumo": 88, "graficos_integrados": true}' WHERE id = 1;
UPDATE productos SET especificaciones = '{"socket": "AM5", "consumo": 162, "graficos_integrados": true}' WHERE id = 2;
UPDATE productos SET especificaciones = '{"socket": "LGA1700", "consumo": 148, "graficos_integrados": false}' WHERE id = 3;
UPDATE productos SET especificaciones = '{"socket": "AM4", "consumo": 76, "graficos_integrados": false}' WHERE id = 25;
UPDATE productos SET especificaciones = '{"socket": "LGA1700", "consumo": 253, "graficos_integrados": true}' WHERE id = 26;
UPDATE productos SET especificaciones = '{"consumo": 115}' WHERE id = 4;
UPDATE productos SET especificaciones = '{"consumo": 165}' WHERE id = 5;
UPDATE productos SET especificaciones = '{"consumo": 220}' WHERE id = 6;
UPDATE productos SET especificaciones = '{"socket": "AM5", "memoria": "DDR5", "formato": "Micro ATX"}' WHERE id = 7;
UPDATE productos SET especificaciones = '{"socket": "LGA1700", "memoria": "DDR5", "formato": "Micro ATX"}' WHERE id = 8;
UPDATE productos SET especificaciones = '{"socket": "AM4", "memoria": "DDR4", "formato": "Micro ATX"}' WHERE id = 9;
UPDATE productos SET especificaciones = '{"socket": "AM5", "memoria": "DDR5", "formato": "ATX"}' WHERE id = 28;
UPDATE productos SET especificaciones = '{"memoria": "DDR5"}' WHERE id IN (10, 11);
UPDATE productos SET especificaciones = '{"memoria": "DDR4"}' WHERE id = 27;
UPDATE productos SET especificaciones = '{"potencia": 450}' WHERE id = 29;
UPDATE productos SET especificaciones = '{"potencia": 650}' WHERE id = 30;
UPDATE productos SET especificaciones = '{"potencia": 850}' WHERE id = 31;
UPDATE productos SET especificaciones = '{"formatos": ["ATX", "Micro ATX", "Mini ITX"]}' WHERE id = 32;
UPDATE productos SET especificaciones = '{"formatos": ["Micro ATX", "Mini ITX"]}' WHERE id = 33;

INSERT INTO pedidos (id, usuario_id, fecha, estado, metodo_entrega, provincia, direccion_envio, costo_envio, total, medio_pago, pago_id, pagado_en) VALUES
  (1, 5, '2026-06-01 20:30:00', 'entregado', 'envio', 'Ciudad Autónoma de Buenos Aires', 'Rivadavia 2150, Buenos Aires', 4500, 654498, 'simulado', 'SIM-0001', '2026-06-01 20:34:00'),
  (2, 6, '2026-06-04 12:15:00', 'entregado', 'envio', 'Mendoza', 'Sarmiento 340, Mendoza', 8500, 258499, 'simulado', 'SIM-0002', '2026-06-04 12:19:00'),
  (3, 6, '2026-06-21 11:00:00', 'entregado', 'envio', 'Mendoza', 'Sarmiento 340, Mendoza', 8500, 438499, 'simulado', 'SIM-0003', '2026-06-21 11:04:00'),
  (4, 5, '2026-07-03 18:45:00', 'entregado', 'envio', 'Ciudad Autónoma de Buenos Aires', 'Rivadavia 2150, Buenos Aires', 4500, 224499, 'simulado', 'SIM-0004', '2026-07-03 18:49:00'),
  (5, 4, '2026-07-18 09:00:00', 'entregado', 'envio', 'Tucumán', 'Mitre 789, San Miguel de Tucumán', 9500, 949497, 'simulado', 'SIM-0005', '2026-07-18 09:04:00'),
  (6, 7, '2026-07-22 10:15:00', 'entregado', 'envio', 'Córdoba', 'Av. Colón 1500, Córdoba', 0, 1949998, 'simulado', 'SIM-0006', '2026-07-22 10:19:00'),
  (7, 5, '2026-07-24 12:00:00', 'entregado', 'retiro', NULL, NULL, 0, 769998, 'simulado', 'SIM-0007', '2026-07-24 12:04:00'),
  (8, 3, '2026-08-07 20:45:00', 'entregado', 'envio', 'Santa Fe', 'San Martín 456, Rosario', 7500, 207499, 'simulado', 'SIM-0008', '2026-08-07 20:49:00'),
  (9, 3, '2026-08-18 12:45:00', 'entregado', 'envio', 'Santa Fe', 'San Martín 456, Rosario', 7500, 597498, 'simulado', 'SIM-0009', '2026-08-18 12:49:00'),
  (10, 5, '2026-08-21 18:30:00', 'entregado', 'envio', 'Ciudad Autónoma de Buenos Aires', 'Rivadavia 2150, Buenos Aires', 0, 1989996, 'simulado', 'SIM-0010', '2026-08-21 18:34:00'),
  (11, 7, '2026-08-23 21:00:00', 'entregado', 'envio', 'Córdoba', 'Av. Colón 1500, Córdoba', 7500, 607498, 'simulado', 'SIM-0011', '2026-08-23 21:04:00'),
  (12, 4, '2026-09-06 14:30:00', 'entregado', 'envio', 'Tucumán', 'Mitre 789, San Miguel de Tucumán', 9500, 739498, 'simulado', 'SIM-0012', '2026-09-06 14:34:00'),
  (13, 5, '2026-09-14 11:15:00', 'entregado', 'retiro', NULL, NULL, 0, 1189997, 'simulado', 'SIM-0013', '2026-09-14 11:19:00'),
  (14, 6, '2026-09-23 21:30:00', 'entregado', 'envio', 'Mendoza', 'Sarmiento 340, Mendoza', 8500, 68498, 'simulado', 'SIM-0014', '2026-09-23 21:34:00'),
  (15, 7, '2026-09-25 10:00:00', 'entregado', 'envio', 'Córdoba', 'Av. Colón 1500, Córdoba', 7500, 577499, 'simulado', 'SIM-0015', '2026-09-25 10:04:00'),
  (16, 3, '2026-09-26 15:00:00', 'entregado', 'envio', 'Santa Fe', 'San Martín 456, Rosario', 7500, 67498, 'simulado', 'SIM-0016', '2026-09-26 15:04:00'),
  (17, 4, '2026-10-09 09:45:00', 'entregado', 'envio', 'Tucumán', 'Mitre 789, San Miguel de Tucumán', 9500, 289498, 'simulado', 'SIM-0017', '2026-10-09 09:49:00'),
  (18, 7, '2026-10-12 17:00:00', 'entregado', 'envio', 'Córdoba', 'Av. Colón 1500, Córdoba', 7500, 457496, 'simulado', 'SIM-0018', '2026-10-12 17:04:00'),
  (19, 3, '2026-10-20 15:00:00', 'entregado', 'envio', 'Santa Fe', 'San Martín 456, Rosario', 7500, 437499, 'simulado', 'SIM-0019', '2026-10-20 15:04:00'),
  (20, 2, '2026-10-20 15:30:00', 'entregado', 'envio', 'Córdoba', 'Av. Belgrano 1234, Córdoba', 7500, 287497, 'simulado', 'SIM-0020', '2026-10-20 15:34:00'),
  (21, 6, '2026-10-26 17:30:00', 'entregado', 'envio', 'Mendoza', 'Sarmiento 340, Mendoza', 8500, 288499, 'simulado', 'SIM-0021', '2026-10-26 17:34:00'),
  (22, 4, '2026-10-28 19:30:00', 'entregado', 'envio', 'Tucumán', 'Mitre 789, San Miguel de Tucumán', 9500, 789497, 'simulado', 'SIM-0022', '2026-10-28 19:34:00'),
  (23, 4, '2026-11-02 09:15:00', 'pendiente', 'envio', 'Tucumán', 'Mitre 789, San Miguel de Tucumán', 9500, 609496, NULL, NULL, NULL),
  (24, 2, '2026-11-02 10:15:00', 'pagado', 'retiro', NULL, NULL, 0, 99998, 'simulado', 'SIM-0024', '2026-11-02 10:19:00'),
  (25, 4, '2026-11-04 21:30:00', 'cancelado', 'envio', 'Tucumán', 'Mitre 789, San Miguel de Tucumán', 9500, 779497, NULL, NULL, NULL),
  (26, 3, '2026-11-06 19:45:00', 'pagado', 'envio', 'Santa Fe', 'San Martín 456, Rosario', 7500, 517498, 'simulado', 'SIM-0026', '2026-11-06 19:49:00'),
  (27, 6, '2026-11-10 10:15:00', 'enviado', 'envio', 'Mendoza', 'Sarmiento 340, Mendoza', 8500, 298498, 'simulado', 'SIM-0027', '2026-11-10 10:19:00'),
  (28, 5, '2026-11-12 10:45:00', 'pagado', 'envio', 'Ciudad Autónoma de Buenos Aires', 'Rivadavia 2150, Buenos Aires', 4500, 184498, 'simulado', 'SIM-0028', '2026-11-12 10:49:00');

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
