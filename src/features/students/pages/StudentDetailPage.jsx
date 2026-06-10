import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import { Button, Card, Skeleton, Badge } from '../../../shared/components/ui/index.js';
import StudentForm from '../components/StudentForm.jsx';
import { studentService } from '../services/studentService.js';
import { useStudentForm } from '../hooks/useStudentForm.js';
import { useAuthStore } from '../../auth/stores/authStore.js';
import { ROLES } from '../../../shared/utils/constants.js';
import { formatDate, formatGrade } from '../../../shared/utils/formatters.js';
import ErrorState from '../../../shared/components/feedback/ErrorState.jsx';

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = useAuthStore((s) => s.role);
  const isCoordinator = role === ROLES.COORDINATOR;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await studentService.getById(id);
        setStudent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const { form, loading: saving, onSubmit } = useStudentForm(student);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState description={error} onRetry={() => navigate('/students')} />;
  }

  if (!student) return null;

  const handleSubmit = async (values) => {
    const ok = await onSubmit(values);
    if (ok) {
      setStudent({ ...student, ...values });
      navigate(`/students/${id}`);
    }
  };

  if (isEdit) {
    return (
      <div>
        <PageHeader
          title={`Editar · ${student.studentName} ${student.studentSurname}`}
          description="Modifica los datos del estudiante."
          action={
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate(`/students/${id}`)}
            >
              Volver
            </Button>
          }
        />
        <Card>
          <StudentForm
            form={form}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/students/${id}`)}
            loading={saving}
            isCoordinator={isCoordinator}
            submitLabel="Guardar cambios"
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${student.studentName} ${student.studentSurname}`}
        description="Información detallada del estudiante."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/students')}
            >
              Volver
            </Button>
            <Button variant="primary" onClick={() => navigate(`/students/${id}?edit=1`)}>
              Editar
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-base font-display font-semibold text-on-surface mb-4">
            Datos personales
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-on-surface-variant">Nombre</dt>
            <dd className="text-on-surface">{student.studentName}</dd>
            <dt className="text-on-surface-variant">Apellido</dt>
            <dd className="text-on-surface">{student.studentSurname}</dd>
            <dt className="text-on-surface-variant">Correo</dt>
            <dd className="text-on-surface break-all">{student.email}</dd>
            <dt className="text-on-surface-variant">Carnet</dt>
            <dd className="text-on-surface font-mono">{student.idCard}</dd>
            <dt className="text-on-surface-variant">Grado</dt>
            <dd>
              <Badge variant="info">{formatGrade(student.grade)}</Badge>
            </dd>
          </dl>
        </Card>
        <Card>
          <h3 className="text-base font-display font-semibold text-on-surface mb-4">
            Estado y métricas
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-on-surface-variant">Estado</dt>
            <dd>
              <Badge variant={student.isActive ? 'success' : 'default'}>
                {student.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </dd>
            <dt className="text-on-surface-variant">Infracciones</dt>
            <dd>
              <Badge variant={(student.infractions ?? 0) > 0 ? 'error' : 'default'}>
                {student.infractions ?? 0}
              </Badge>
            </dd>
            <dt className="text-on-surface-variant">Creado</dt>
            <dd className="text-on-surface">{formatDate(student.createdAt)}</dd>
            <dt className="text-on-surface-variant">Actualizado</dt>
            <dd className="text-on-surface">{formatDate(student.updatedAt)}</dd>
          </dl>
        </Card>
      </div>
    </div>
  );
};

export default StudentDetailPage;
