import { create } from 'zustand';

const initialFilters = { search: '', grade: '', isActive: '' };

export const useStudentStore = create((set) => ({
  students: [],
  selectedStudent: null,
  loading: false,
  pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, limit: 10 },
  filters: { ...initialFilters },
  setLoading: (loading) => set({ loading }),
  setStudents: (data, pagination) => set({ students: data, pagination }),
  appendStudents: (data) => set((state) => ({ students: [...state.students, ...data] })),
  setSelected: (student) => set({ selectedStudent: student }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: { ...initialFilters } }),
  setPagination: (pagination) => set({ pagination }),
}));
