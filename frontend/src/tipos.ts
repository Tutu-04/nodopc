export type Rol = 'admin' | 'cliente';

export interface UsuarioDeSesion {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface Usuario extends UsuarioDeSesion {
  creado_en: string;
}

export type Componente =
  'procesador' | 'motherboard' | 'memoria' | 'placa_de_video' | 'almacenamiento' | 'fuente' | 'gabinete';

export interface Especificaciones {
  socket?: string;
  consumo?: number;
  graficos_integrados?: boolean;
  memoria?: string;
  formato?: string;
  potencia?: number;
  formatos?: string[];
}

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

export interface PaginaDeProductos {
  productos: Producto[];
  total: number;
  pagina: number;
  porPagina: number;
  paginas: number;
}

export type EstadoPedido = 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';
export type MetodoEntrega = 'envio' | 'retiro';
export type MedioDePago = 'mercadopago' | 'simulado';

export interface ItemPedido {
  id: number;
  producto_id: number | null;
  producto: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  fecha: string;
  estado: EstadoPedido;
  metodo_entrega: MetodoEntrega;
  provincia: string | null;
  direccion_envio: string | null;
  costo_envio: number;
  total: number;
  medio_pago: MedioDePago | null;
  pago_id: string | null;
  pagado_en: string | null;
  vence_en: string | null;
  cliente: string;
  cliente_email: string;
  segundos_para_pagar: number | null;
}

export interface PedidoConItems extends Pedido {
  items: ItemPedido[];
  estados_siguientes?: EstadoPedido[];
}

export interface Provincia {
  nombre: string;
  costo: number;
}

export interface CondicionesDeEnvio {
  provincias: Provincia[];
  envioGratisDesde: number;
  minutosParaPagar: number;
}

export interface MediosDePago {
  mercadopago: boolean;
  simulado: boolean;
}

export interface OpcionDelArmador {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen_url: string | null;
  especificaciones: Especificaciones | null;
  marca: string;
}

export interface PasoDelArmador {
  clave: Componente;
  titulo: string;
  obligatorio: boolean;
  productos: OpcionDelArmador[];
}

export interface ProblemaDelArmado {
  tipo?: 'incompatible' | 'falta' | 'sin_stock';
  pasos?: Componente[];
  mensaje: string;
}

export interface ResultadoDelArmado {
  problemas: ProblemaDelArmado[];
  avisos: string[];
  faltan: Componente[];
  consumo: number;
  potenciaRecomendada: number;
  total: number;
  completo: boolean;
  incompatibles: Partial<Record<Componente, Record<number, string>>>;
}

export interface CampoDeFicha {
  tipo: 'texto' | 'numero' | 'si_o_no' | 'lista';
  etiqueta: string;
  opciones?: string[];
}

export type CamposDeFicha = Partial<Record<keyof Especificaciones, CampoDeFicha>>;
