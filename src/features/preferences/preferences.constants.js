export const EMAIL_STRATEGIES = [
  { value: 'daily_report', label: 'Reporte diario (PDF consolidado)' },
  { value: 'per_cycle', label: 'Por ciclo de 3 infracciones' },
  { value: 'disabled', label: 'Desactivado' },
];

export const REPORT_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'html', label: 'HTML' },
];

export const REPORT_DAYS = [
  { value: 'MON', label: 'L' },
  { value: 'TUE', label: 'M' },
  { value: 'WED', label: 'X' },
  { value: 'THU', label: 'J' },
  { value: 'FRI', label: 'V' },
  { value: 'SAT', label: 'S' },
  { value: 'SUN', label: 'D' },
];

export const STUDENT_NOTIFY_MODES = [
  { value: 'first_only', label: 'Solo en la primera infracción del día' },
  { value: 'every', label: 'En cada advertencia' },
  { value: 'disabled', label: 'No enviar' },
];

export const DEFAULT_PREFERENCES = {
  emailStrategy: 'per_cycle',
  reportTime: '18:00',
  reportDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  minInfractions: 1,
  reportFormat: 'pdf',
  immediateCritical: true,
  immediateThreshold: 5,
  studentNotify: 'first_only',
};
