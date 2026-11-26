import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLOR_BARRAS } from '../utils/colores';

const ESTILO_EJE = { fontSize: 12, fill: '#525252' };

function recortar(texto: string, largo: number): string {
  return texto.length > largo ? `${texto.slice(0, largo - 1)}…` : texto;
}

interface PropsDeEtiqueta {
  x?: number | string;
  y?: number | string;
  payload?: { value: string };
}

function EtiquetaCategoria({ x, y, payload }: PropsDeEtiqueta) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#525252" fontSize={12}>
      {recortar(payload?.value ?? '', 24)}
    </text>
  );
}

interface Props {
  datos: object[];
  claveEtiqueta: string;
  claveValor: string;
  nombreValor: string;
  formatoValor: (valor: number) => string;
  formatoEje?: (valor: number) => string;
  horizontal?: boolean;
  alto?: number;
}

export default function GraficoBarras({
  datos,
  claveEtiqueta,
  claveValor,
  nombreValor,
  formatoValor,
  formatoEje = formatoValor,
  horizontal = false,
  alto = 280,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart
        data={datos}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
      >
        <CartesianGrid stroke="#e5e5e5" horizontal={!horizontal} vertical={horizontal} />

        <XAxis
          type={horizontal ? 'number' : 'category'}
          dataKey={horizontal ? undefined : claveEtiqueta}
          tickFormatter={horizontal ? formatoEje : undefined}
          tick={ESTILO_EJE}
          tickLine={false}
          axisLine={{ stroke: '#d4d4d4' }}
        />
        <YAxis
          type={horizontal ? 'category' : 'number'}
          dataKey={horizontal ? claveEtiqueta : undefined}
          tickFormatter={horizontal ? undefined : formatoEje}
          width={horizontal ? 190 : 72}
          tick={horizontal ? EtiquetaCategoria : ESTILO_EJE}
          tickLine={false}
          axisLine={false}
        />

        <Tooltip
          formatter={(valor) => [formatoValor(Number(valor)), nombreValor]}
          cursor={{ fill: '#f5f5f5' }}
          contentStyle={{ border: '1px solid #d4d4d4', borderRadius: 0, fontSize: 13 }}
          itemStyle={{ color: '#171717' }}
          labelStyle={{ fontWeight: 700, color: '#171717' }}
        />

        <Bar
          dataKey={claveValor}
          name={nombreValor}
          fill={COLOR_BARRAS}
          radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          maxBarSize={horizontal ? 22 : 48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
