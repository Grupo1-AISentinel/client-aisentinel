import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Mail, FileText, Settings as SettingsIcon } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  Input,
  Select,
  Badge,
} from '../../../shared/components/ui/index.js';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import { extractErrorMessage } from '../../../shared/api/errors.js';
import { preferenceService } from '../services/preferenceService.js';
import {
  EMAIL_STRATEGIES,
  REPORT_FORMATS,
  REPORT_DAYS,
  STUDENT_NOTIFY_MODES,
  DEFAULT_PREFERENCES,
} from '../preferences.constants.js';

const isValidTime = (t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

const AlertPreferencesPage = () => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [defaults, setDefaults] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    preferenceService
      .getAlerts()
      .then((res) => {
        if (cancelled) return;
        if (res?.preferences) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...res.preferences });
          if (res.defaults) setDefaults(res.defaults);
        }
      })
      .catch((err) => {
        if (!cancelled)
          toast.error(extractErrorMessage(err, 'No se pudieron cargar las preferencias'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleField = (field, value) => {
    setPreferences((p) => ({ ...p, [field]: value }));
  };

  const toggleDay = (day) => {
    setPreferences((p) => {
      const has = p.reportDays?.includes(day);
      const next = has ? p.reportDays.filter((d) => d !== day) : [...(p.reportDays || []), day];
      return { ...p, reportDays: next.length > 0 ? next : p.reportDays };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (preferences.emailStrategy === 'daily_report' && !isValidTime(preferences.reportTime)) {
      toast.error('Hora inválida. Use formato HH:MM.');
      return;
    }
    if (
      preferences.emailStrategy === 'daily_report' &&
      (!Array.isArray(preferences.reportDays) || preferences.reportDays.length === 0)
    ) {
      toast.error('Seleccione al menos un día para el reporte diario.');
      return;
    }
    setSaving(true);
    try {
      const response = await preferenceService.updateAlerts(preferences);
      if (response?.preferences) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...response.preferences });
        toast.success('Preferencias guardadas');
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Error al guardar las preferencias'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Preferencias de notificaciones" />
        <Card glass>
          <div className="p-6 text-on-surface-variant text-sm">Cargando…</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Preferencias de notificaciones"
        subtitle="Configure cómo y cuándo recibir correos sobre infracciones de uniforme."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card glass>
          <CardHeader
            title="Estrategia de email al coordinador"
            description="Define cómo recibe los avisos de infracciones."
            action={<Mail className="w-4 h-4 text-secondary" />}
          />
          <div className="flex flex-col gap-3">
            {EMAIL_STRATEGIES.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-3 p-3 rounded-md border border-white/10 hover:border-white/20 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="emailStrategy"
                  value={opt.value}
                  checked={preferences.emailStrategy === opt.value}
                  onChange={(e) => handleField('emailStrategy', e.target.value)}
                  className="mt-1 accent-secondary"
                />
                <div className="flex-1">
                  <p className="text-sm text-on-surface font-medium">{opt.label}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {preferences.emailStrategy === 'daily_report' && (
          <Card glass>
            <CardHeader
              title="Reporte diario"
              description="Se enviará un PDF consolidado a la hora configurada."
              action={<FileText className="w-4 h-4 text-secondary" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="time"
                label="Hora de envío"
                value={preferences.reportTime}
                onChange={(e) => handleField('reportTime', e.target.value)}
              />
              <Select
                label="Formato"
                options={REPORT_FORMATS}
                value={preferences.reportFormat}
                onChange={(e) => handleField('reportFormat', e.target.value)}
              />
            </div>
            <div className="mt-4">
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">
                Días
              </p>
              <div className="flex flex-wrap gap-2">
                {REPORT_DAYS.map((d) => {
                  const active = preferences.reportDays?.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={
                        active
                          ? 'px-3 py-1.5 rounded-md bg-secondary text-amber-900 font-label text-xs font-bold'
                          : 'px-3 py-1.5 rounded-md bg-surface-container text-on-surface-variant font-label text-xs hover:bg-surface-container-high'
                      }
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4">
              <Input
                type="number"
                min="1"
                label="Mínimo de infracciones para enviar"
                helper="Si el día tiene menos infracciones, no se envía el reporte."
                value={preferences.minInfractions}
                onChange={(e) =>
                  handleField('minInfractions', Math.max(1, parseInt(e.target.value, 10) || 1))
                }
              />
            </div>
          </Card>
        )}

        <Card glass>
          <CardHeader
            title="Alertas críticas inmediatas"
            description="Se envía email inmediato solo si la cantidad de infracciones supera el umbral."
            action={<SettingsIcon className="w-4 h-4 text-secondary" />}
          />
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(preferences.immediateCritical)}
                onChange={(e) => handleField('immediateCritical', e.target.checked)}
                className="accent-secondary w-4 h-4"
              />
              <span className="text-sm text-on-surface">
                Enviar email inmediato al superar el umbral
              </span>
            </label>
            <Input
              type="number"
              min="1"
              label="Umbral de infracciones del día"
              helper="Si el estudiante acumula esta cantidad de infracciones en el día, se envía email inmediato aunque la estrategia sea daily_report o disabled."
              value={preferences.immediateThreshold}
              onChange={(e) =>
                handleField('immediateThreshold', Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              disabled={!preferences.immediateCritical}
            />
          </div>
        </Card>

        <Card glass>
          <CardHeader
            title="Email al estudiante"
            description="El estudiante recibe avisos por infracciones de uniforme."
            action={<Mail className="w-4 h-4 text-secondary" />}
          />
          <Select
            label="Frecuencia de aviso"
            options={STUDENT_NOTIFY_MODES}
            value={preferences.studentNotify}
            onChange={(e) => handleField('studentNotify', e.target.value)}
          />
        </Card>

        <div className="flex justify-end gap-2">
          <Badge variant="default">
            <span className="text-[10px]">Defaults del servidor</span>
          </Badge>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
            loading={saving}
          >
            Guardar preferencias
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AlertPreferencesPage;
