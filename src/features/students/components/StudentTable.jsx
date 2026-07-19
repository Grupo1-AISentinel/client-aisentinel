import { Badge, Button } from '../../../shared/components/ui/index.js';
import { formatGrade, formatDate } from '../../../shared/utils/formatters.js';

const StudentTable = ({ students, onSelect, onEdit, onToggle, onDelete }) => {
  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (row) => (
        <div>
          <p className="font-medium text-on-surface">
            {row.studentName} {row.studentSurname}
          </p>
          <p className="text-xs text-on-surface-dim">{row.email}</p>
        </div>
      ),
    },
    { key: 'idCard', header: 'Carnet' },
    {
      key: 'grade',
      header: 'Grado',
      render: (row) => <span className="font-label">{formatGrade(row.grade)}</span>,
    },
    {
      key: 'infractions',
      header: 'Infracciones',
      align: 'center',
      render: (row) => (
        <Badge variant={row.infractions > 0 ? 'error' : 'default'}>{row.infractions ?? 0}</Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Creado',
      render: (row) => (
        <span className="text-on-surface-dim text-xs">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => onSelect?.(row)}
            className="text-amber-300 hover:text-amber-200"
          >
            Ver
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => onEdit?.(row)}
            className="text-amber-300 hover:text-amber-200"
          >
            Editar
          </Button>
          <Button size="xs" variant="outline" onClick={() => onToggle?.(row)}>
            {row.isActive ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => onDelete?.(row)}
            className="text-error-bright hover:bg-error/10"
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return { columns, rows: students };
};

export default StudentTable;
