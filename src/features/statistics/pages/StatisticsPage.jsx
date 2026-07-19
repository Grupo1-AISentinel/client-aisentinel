import { useState, useMemo, useEffect } from 'react';
import { Download, BarChart3, TrendingUp, Calendar, PieChart as PieIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import {
  Card,
  CardHeader,
  Button,
  Modal,
  Input,
  Skeleton,
} from '../../../shared/components/ui/index.js';
import ExportReportModal from '../../../shared/components/ui/ExportReportModal.jsx';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';
import { statisticsService } from '../services/statisticsService.js';
import { theme } from '../../../styles/theme.js';
import toast from 'react-hot-toast';

const useStatsData = () => {
  const [data, setData] = useState({
    grades: [],
    students: [],
    objects: null,
    days: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const [grades, students, objects, days] = await Promise.all([
        statisticsService.getGrades(),
        statisticsService.getStudents(),
        statisticsService.getObjects(),
        statisticsService.getDays(),
      ]);
      setData({ grades, students, objects, days });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { ...data, loading, error, refetch: fetch };
};

const GradesChart = ({ data }) => {
  const formatted = useMemo(
    () => data.map((d) => ({ grade: d._id, total: d.totalInfractions })),
    [data]
  );
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted}>
        <CartesianGrid stroke={theme.chart.grid} strokeDasharray="3 3" />
        <XAxis dataKey="grade" stroke={theme.chart.textMuted} />
        <YAxis stroke={theme.chart.textMuted} />
        <Tooltip
          contentStyle={{
            background: theme.colors.surfaceContainer,
            border: `1px solid ${theme.colors.outlineDim}`,
            borderRadius: 8,
          }}
          labelStyle={{ color: theme.chart.text }}
        />
        <Bar dataKey="total" fill={theme.chart.primary} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const StudentsRankingChart = ({ data }) => {
  const formatted = useMemo(
    () =>
      data
        .map((s) => ({
          name: `${s.studentSurname || ''}, ${s.studentName || ''}`.trim(),
          infracciones: s.infractions,
        }))
        .slice(0, 10),
    [data]
  );
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={formatted} layout="vertical">
        <CartesianGrid stroke={theme.chart.grid} strokeDasharray="3 3" />
        <XAxis type="number" stroke={theme.chart.textMuted} />
        <YAxis
          dataKey="name"
          type="category"
          width={120}
          stroke={theme.chart.textMuted}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: theme.colors.surfaceContainer,
            border: `1px solid ${theme.colors.outlineDim}`,
            borderRadius: 8,
          }}
        />
        <Bar dataKey="infracciones" fill={theme.chart.error} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const ObjectsChart = ({ data }) => {
  const pieData = useMemo(() => {
    if (!data?.labels || !data?.series) return [];
    return data.labels.map((label, i) => ({
      name: label,
      value: data.series[i] || 0,
    }));
  }, [data]);
  const COLORS = [theme.chart.primary, theme.chart.error, theme.chart.info, theme.chart.success];
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          label
        >
          {pieData.map((_, i) => (
            <Cell
              key={i}
              fill={COLORS[i % COLORS.length]}
              stroke={theme.colors.surface}
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: theme.colors.surfaceContainer,
            border: `1px solid ${theme.colors.outlineDim}`,
            borderRadius: 8,
          }}
        />
        <Legend wrapperStyle={{ color: theme.chart.textMuted }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const DaysChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={280}>
    <LineChart data={data}>
      <CartesianGrid stroke={theme.chart.grid} strokeDasharray="3 3" />
      <XAxis dataKey="day" stroke={theme.chart.textMuted} />
      <YAxis stroke={theme.chart.textMuted} />
      <Tooltip
        contentStyle={{
          background: theme.colors.surfaceContainer,
          border: `1px solid ${theme.colors.outlineDim}`,
          borderRadius: 8,
        }}
      />
      <Line
        type="monotone"
        dataKey="totalInfractions"
        stroke={theme.chart.tertiary}
        strokeWidth={2}
        dot={{ r: 4, fill: theme.chart.tertiary }}
      />
    </LineChart>
  </ResponsiveContainer>
);

const ExportModal = ({ open, onClose, type, label }) => (
  <ExportReportModal
    open={open}
    onClose={onClose}
    type={type}
    statisticsApi={statisticsService}
    currentUserEmail=""
  />
);

const StatisticsPage = () => {
  const { grades, students, objects, days, loading, error, refetch } = useStatsData();
  const [exportType, setExportType] = useState(null);

  const exportLabels = {
    Grades: 'Grados con más infracciones',
    Students: 'Top 10 Estudiantes',
    Objects: 'Tipos de infracción',
    Days: 'Análisis semanal',
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Estadísticas" />
        <ErrorState description={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Estadísticas e inteligencia"
        description="Análisis agregado de infracciones, asistencia y uso del sistema."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="Infracciones por grado"
            description="Total acumulado por grado escolar."
            action={
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => setExportType('Grades')}
              >
                Exportar
              </Button>
            }
          />
          {loading ? <Skeleton className="h-64 w-full" /> : <GradesChart data={grades} />}
        </Card>

        <Card>
          <CardHeader
            title="Tipos de infracción"
            description="Distribución de motivos detectados."
            action={
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => setExportType('Objects')}
              >
                Exportar
              </Button>
            }
          />
          {loading ? <Skeleton className="h-64 w-full" /> : <ObjectsChart data={objects} />}
        </Card>

        <Card>
          <CardHeader
            title="Infracciones por día de la semana"
            description="Distribución de detecciones en el ciclo semanal."
            action={
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => setExportType('Days')}
              >
                Exportar
              </Button>
            }
          />
          {loading ? <Skeleton className="h-64 w-full" /> : <DaysChart data={days} />}
        </Card>

        <Card>
          <CardHeader
            title="Top 10 estudiantes con más infracciones"
            description="Ranking histórico basado en conteo diario."
            action={
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => setExportType('Students')}
              >
                Exportar
              </Button>
            }
          />
          {loading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <StudentsRankingChart data={students} />
          )}
        </Card>
      </div>

      {exportType && (
        <ExportModal
          open={Boolean(exportType)}
          onClose={() => setExportType(null)}
          type={exportType}
          label={exportLabels[exportType]}
        />
      )}
    </div>
  );
};

export default StatisticsPage;
