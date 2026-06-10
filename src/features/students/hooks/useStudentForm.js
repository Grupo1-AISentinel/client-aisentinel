import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { studentService } from '../services/studentService.js';
import { useAuthStore } from '../../auth/stores/authStore.js';
import { ROLES } from '../../../shared/utils/constants.js';

export const useStudentForm = (student = null) => {
  const [loading, setLoading] = useState(false);
  const role = useAuthStore((s) => s.role);
  const coordinatorGrade = useAuthStore((s) => s.user?.coordinatorGrade);

  const defaultValues = {
    studentName: student?.studentName || '',
    studentSurname: student?.studentSurname || '',
    email: student?.email || '',
    idCard: student?.idCard || '',
    grade: role === ROLES.COORDINATOR && coordinatorGrade ? coordinatorGrade : student?.grade || '',
    photos: [],
  };

  const form = useForm({ defaultValues, mode: 'onBlur' });

  useEffect(() => {
    if (student) {
      form.reset({
        studentName: student.studentName,
        studentSurname: student.studentSurname,
        email: student.email,
        idCard: student.idCard,
        grade: student.grade,
        photos: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      if (student?._id) {
        await studentService.update(student._id, values);
        toast.success('Estudiante actualizado');
      } else {
        await studentService.create(values);
        toast.success('Estudiante creado');
      }
      return true;
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar el estudiante');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, onSubmit, isCoordinator: role === ROLES.COORDINATOR };
};
