import { useNavigate } from 'react-router';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import { Card } from '../../../shared/components/ui/index.js';
import StudentForm from '../components/StudentForm.jsx';
import { useStudentForm } from '../hooks/useStudentForm.js';

const StudentCreatePage = () => {
  const navigate = useNavigate();
  const { form, loading, onSubmit, isCoordinator } = useStudentForm();

  const handleSubmit = async (values) => {
    const ok = await onSubmit(values);
    if (ok) navigate('/students');
  };

  return (
    <div>
      <PageHeader
        title="Nuevo estudiante"
        description="Registra un estudiante y sus fotos de referencia para el reconocimiento facial."
      />
      <Card>
        <StudentForm
          form={form}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/students')}
          loading={loading}
          isCoordinator={isCoordinator}
        />
      </Card>
    </div>
  );
};

export default StudentCreatePage;
