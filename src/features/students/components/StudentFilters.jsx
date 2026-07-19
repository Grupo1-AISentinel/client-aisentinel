import { Search, Filter, X } from 'lucide-react';
import { useStudentStore } from '../stores/studentStore.js';
import { Input, Select, Button } from '../../../shared/components/ui/index.js';
import { GRADES } from '../../../shared/utils/constants.js';

const StudentFilters = ({ onApply, onReset, isCoordinator }) => {
  const { filters, setFilters } = useStudentStore();
  const update = (patch) => setFilters(patch);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-surface-3 border border-amber-400/15 rounded-lg p-4">
      <Input
        leftIcon={<Search className="w-4 h-4" />}
        placeholder="Buscar por nombre o carnet"
        value={filters.search || ''}
        onChange={(e) => update({ search: e.target.value })}
      />
      {!isCoordinator && (
        <Select
          options={[
            { value: '', label: 'Todos los grados' },
            ...GRADES.map((g) => ({ value: g, label: g })),
          ]}
          value={filters.grade || ''}
          onChange={(e) => update({ grade: e.target.value })}
        />
      )}
      <Select
        options={[
          { value: '', label: 'Todos' },
          { value: 'true', label: 'Activos' },
          { value: 'false', label: 'Inactivos' },
        ]}
        value={filters.isActive ?? ''}
        onChange={(e) => update({ isActive: e.target.value })}
      />
      <div className="flex items-center gap-2">
        <Button variant="primary" leftIcon={<Filter className="w-4 h-4" />} onClick={onApply}>
          Aplicar
        </Button>
        <Button variant="ghost" leftIcon={<X className="w-4 h-4" />} onClick={onReset}>
          Limpiar
        </Button>
      </div>
    </div>
  );
};

export default StudentFilters;
