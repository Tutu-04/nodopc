import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatearPorcentaje } from '../utils/formato';

interface PropsDeEtiqueta {
  x?: number;
  y?: number;
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit';
  percent?: number;
}

export interface DatoDeTorta {
  nombre: string;
  valor: number;
  color: string;
}

function EtiquetaPorcentaje({ x, y, textAnchor, percent = 0 }: PropsDeEtiqueta) {
  if (percent < 0.04) return null;

  return (
    <text x={x} y={y} textAnchor={textAnchor} dominantBaseline="central" fill="#404040" fontSize={12} fontWeight={700}>
      {Math.round(percent * 100)}%
    </text>
  );
}

interface Props {
  datos: DatoDeTorta[];
  formatoValor: (valor: number) => string;
  dona?: boolean;
  alto?: number;
}

export default function GraficoTorta({ datos, formatoValor, dona = false, alto = 300 }: Props) {
  const total = datos.reduce((suma, dato) => suma + dato.valor, 0);

  return (
    <ResponsiveContainer width="100%" height={alto}>
      <PieChart>
        <Pie
          data={datos}
          dataKey="valor"
          nameKey="nombre"
          innerRadius={dona ? '50%' : 0}
          outerRadius="72%"
          stroke="#ffffff"
          strokeWidth={2}
          label={EtiquetaPorcentaje}
          labelLine={{ stroke: '#a3a3a3' }}
        />

        <Tooltip
          formatter={(valor, nombre) => [
            `${formatoValor(Number(valor))} (${formatearPorcentaje(Number(valor), total)})`,
            nombre,
          ]}
          contentStyle={{ border: '1px solid #d4d4d4', borderRadius: 0, fontSize: 13 }}
          itemStyle={{ color: '#171717' }}
        />

        <Legend
          position="bottom"
          itemSorter={null}
          iconType="circle"
          formatter={(nombre) => <span style={{ color: '#404040', fontSize: 13 }}>{nombre}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
