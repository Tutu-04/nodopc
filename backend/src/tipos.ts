import type { RowDataPacket } from 'mysql2';

export type Fila<T> = T & RowDataPacket;

export type Rol = 'admin' | 'cliente';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  creado_en: Date;
}

export interface UsuarioConPassword extends Usuario {
  password: string;
}

export interface UsuarioDeSesion {
  id: number;
  nombre: string;
  rol: Rol;
}

export type Componente =
  'procesador' | 'motherboard' | 'memoria' | 'placa_de_video' | 'almacenamiento' | 'fuente' | 'gabinete';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  componente: Componente | null;
  cantidad_productos?: number;
}

export interface Marca {
  id: number;
  nombre: string;
  pais: string | null;
  cantidad_productos?: number;
}

export interface Especificaciones {
  socket?: string;
  consumo?: number;
  graficos_integrados?: boolean;
  memoria?: string;
  formato?: string;
  potencia?: number;
  formatos?: string[];
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  especificaciones: Especificaciones | null;
  precio: number;
  stock: number;
  imagen_url: string | null;
  categoria_id: number;
  marca_id: number;
  categoria: string;
  componente: Componente | null;
  marca: string;
}

export type EstadoPedido = 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';
export type MetodoEntrega = 'envio' | 'retiro';
export type MedioDePago = 'mercadopago' | 'simulado';

export interface ItemPedido {
  id: number;
  pedido_id: number;
  producto_id: number | null;
  producto_nombre: string;
  producto: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  fecha: Date;
  estado: EstadoPedido;
  metodo_entrega: MetodoEntrega;
  provincia: string | null;
  direccion_envio: string | null;
  costo_envio: number;
  total: number;
  medio_pago: MedioDePago | null;
  pago_id: string | null;
  pagado_en: Date | null;
  vence_en: Date | null;
  cliente: string;
  cliente_email: string;
  segundos_para_pagar: number | null;
}

export interface PedidoConItems extends Pedido {
  items: ItemPedido[];
}

export interface ErrorConStatus extends Error {
  status?: number;
  code?: string;
}
