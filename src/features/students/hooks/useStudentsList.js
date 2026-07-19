import { useCallback, useEffect, useState } from 'react';
import { studentService } from '../services/studentService.js';
import { useStudentStore } from '../stores/studentStore.js';
import { useAuthStore } from '../../auth/stores/authStore.js';
import { ROLES } from '../../../shared/utils/constants.js';

export const useStudentsList = ({ page, limit } = {}) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { students, pagination, filters, setStudents, setPagination } = useStudentStore();
  const role = useAuthStore((s) => s.role);
  const coordinatorGrade = useAuthStore((s) => s.user?.coordinatorGrade);

  const fetchStudents = useCallback(
    async (override = {}) => {
      setLoading(true);
      setError(null);
      try {
        const effectivePage = override.page ?? page ?? pagination.currentPage ?? 1;
        const effectiveLimit = override.limit ?? limit ?? pagination.limit ?? 10;
        const params = {
          page: effectivePage,
          limit: effectiveLimit,
          ...filters,
          ...override.params,
        };
        if (filters.isActive === '') delete params.isActive;
        if (role === ROLES.COORDINATOR && coordinatorGrade) {
          params.grade = coordinatorGrade;
        }
        Object.keys(params).forEach((k) => {
          if (params[k] === '' || params[k] === null || params[k] === undefined) delete params[k];
        });

        const result = await studentService.list(params);
        setStudents(result.data, { ...result.pagination, limit: effectiveLimit });
        setPagination(result.pagination);
      } catch (err) {
        setError(err.message || 'No se pudo cargar la lista');
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      limit,
      pagination.currentPage,
      pagination.limit,
      filters,
      role,
      coordinatorGrade,
      setStudents,
      setPagination,
    ]
  );

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), page, limit]);

  return { students, pagination, loading, error, refetch: fetchStudents };
};
