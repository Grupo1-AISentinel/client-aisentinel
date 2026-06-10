import { useState, useMemo, useEffect } from 'react';
import { Download, Mail, FileText, X, Check } from 'lucide-react';
import { Button, Input } from './index.js';
import toast from 'react-hot-toast';

const ALL_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
];

const EXPORT_PRESETS = {
  Grades: {
    label: 'Reporte de Grados',
    sections: {
      index: { key: 'index', label: '#' },
      grade: { key: 'grade', label: 'Grado' },
      students: { key: 'students', label: 'Estudiantes' },
      total: { key: 'total', label: 'Infracciones' },
    },
  },
  Students: {
    label: 'Top 10 Estudiantes',
    sections: {
      index: { key: 'index', label: '#' },
      name: { key: 'name', label: 'Alumno' },
      card: { key: 'card', label: 'Carnet' },
      grade: { key: 'grade', label: 'Grado' },
      total: { key: 'total', label: 'Infracciones' },
    },
  },
  Objects: {
    label: 'Tipos de Infracción',
    sections: {
      index: { key: 'index', label: '#' },
      reason: { key: 'reason', label: 'Tipo' },
      total: { key: 'total', label: 'Total' },
      today: { key: 'today', label: 'Hoy' },
    },
  },
  Days: {
    label: 'Distribución Semanal',
    sections: {
      index: { key: 'index', label: '#' },
      day: { key: 'day', label: 'Día' },
      total: { key: 'total', label: 'Total' },
    },
  },
};

const ExportReportModal = ({
  open,
  onClose,
  type,
  statisticsApi,
  statisticsService,
  currentUserEmail,
}) => {
  const preset = type ? EXPORT_PRESETS[type] : null;
  const allKeys = useMemo(() => (preset ? Object.keys(preset.sections) : []), [preset]);

  const [email, setEmail] = useState(currentUserEmail || '');
  const [format, setFormat] = useState('pdf');
  const [selected, setSelected] = useState(() => {
    const initial = {};
    allKeys.forEach((k) => {
      initial[k] = true;
    });
    return initial;
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (preset) {
      const initial = {};
      allKeys.forEach((k) => {
        initial[k] = true;
      });
      setSelected(initial);
    }
  }, [type, preset, allKeys]);

  const toggle = (key) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = useMemo(() => {
    const active = {};
    allKeys.forEach((k) => {
      if (selected[k]) active[k] = true;
    });
    return active;
  }, [allKeys, selected]);

  if (!open || !preset) return null;

  const selectedCount = Object.values(selected).filter(Boolean).length;

  const downloadFile = async () => {
    if (selectedCount === 0) {
      toast.error('Selecciona al menos una columna');
      return null;
    }
    const service = statisticsService || statisticsApi;
    const fn = service[`export${type}`];
    if (!fn) {
      toast.error('Servicio de exportación no disponible');
      return null;
    }
    const response = await fn({ email: null, format, sections });
    const blob = new Blob([response], {
      type:
        format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf',
    });
    const url = URL.createObjectURL(blob);
    const ext = format === 'excel' ? 'xlsx' : 'pdf';
    const filename = `reporte_${type.toLowerCase()}_${new Date()
      .toISOString()
      .slice(0, 10)}.${ext}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return filename;
  };

  const sendByEmail = async () => {
    if (!email) {
      toast.error('Ingresa un correo de destino');
      return null;
    }
    if (selectedCount === 0) {
      toast.error('Selecciona al menos una columna');
      return null;
    }
    const service = statisticsService || statisticsApi;
    const fn = service[`export${type}`];
    if (!fn) {
      toast.error('Servicio de exportación no disponible');
      return null;
    }
    const response = await fn({ email, format, sections });
    return response;
  };

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    const loading = toast.loading(`Generando ${format.toUpperCase()}…`);
    try {
      const filename = await downloadFile();
      if (filename) toast.success(`Descarga iniciada: ${filename}`, { id: loading });
    } catch (err) {
      const msg = err.message || '';
      const friendly = msg.includes('No hay')
        ? msg
        : msg.includes('Failed')
          ? 'No hay datos suficientes para generar este reporte'
          : msg || 'Error al generar el reporte';
      toast.error(friendly, { id: loading });
    } finally {
      setBusy(false);
    }
  };

  const handleEmail = async () => {
    if (busy) return;
    setBusy(true);
    const loading = toast.loading(`Enviando a ${email}…`);
    try {
      const result = await sendByEmail();
      if (result?.message) toast.success(result.message, { id: loading });
      else toast.success('Reporte enviado', { id: loading });
    } catch (err) {
      toast.error(err.message || 'Error al enviar el reporte', { id: loading });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-on-surface">
              Exportar {preset.label}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Elige las columnas, el formato y el destino
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-md hover:bg-white/5"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-5">
          <div>
            <p className="font-label text-[11px] text-on-surface-variant mb-2.5">
              COLUMNAS A INCLUIR
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allKeys.map((key) => {
                const isChecked = selected[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-left transition-colors ${
                      isChecked
                        ? 'bg-amber-400/10 border-amber-400/40 text-on-surface'
                        : 'bg-white/[0.02] border-white/10 text-on-surface-variant hover:border-white/20'
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-4 h-4 rounded border transition-colors ${
                        isChecked
                          ? 'bg-amber-400 border-amber-400'
                          : 'border-white/20 bg-surface-container-low'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-[#1a1200]" />}
                    </span>
                    <span className="text-xs font-label uppercase tracking-wide">
                      {preset.sections[key].label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] font-mono text-on-surface-dim mt-2">
              {selectedCount} de {allKeys.length} columnas seleccionadas
            </p>
          </div>

          <div>
            <p className="font-label text-[11px] text-on-surface-variant mb-2.5">FORMATO</p>
            <div className="flex gap-2">
              {ALL_FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  className={`flex-1 h-11 rounded-md border text-sm font-label uppercase tracking-wide transition-colors ${
                    format === f.value
                      ? 'bg-amber-400/15 border-amber-400/50 text-amber-300'
                      : 'bg-white/[0.02] border-white/10 text-on-surface-variant hover:border-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-label text-[11px] text-on-surface-variant mb-2.5">
              CORREO DE DESTINO
            </p>
            <Input
              type="email"
              leftIcon={<Mail className="w-4 h-4" />}
              placeholder="destinatario@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <footer className="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between bg-background/30">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            loading={busy}
            fullWidth
            className="sm:flex-1"
          >
            Descargar {format.toUpperCase()}
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={handleEmail}
            loading={busy}
            fullWidth
            className="sm:flex-1"
          >
            Enviar por correo
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ExportReportModal;
