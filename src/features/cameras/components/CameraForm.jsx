import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RefreshCw } from 'lucide-react';
import { Modal, Button } from '../../../shared/components/ui/index.js';
import { Input, Select, Textarea } from '../../../shared/components/ui/index.js';
import CameraSourceSelector from './CameraSourceSelector.jsx';
import CameraSourceFields from './CameraSourceFields.jsx';
import { CAMERA_TYPES, DEFAULT_SOURCE_CONFIG } from '../camera.constants.js';
import { cameraService } from '../services/cameraService.js';

const generateCameraId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CAM-${suffix}`;
};

const CameraForm = ({ isOpen, onClose, onSaved, initial }) => {
  const isEdit = Boolean(initial?._id);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      cameraId: initial?.cameraId || '',
      name: initial?.name || '',
      description: initial?.description || '',
      location: initial?.location || '',
      cameraType: initial?.cameraType || 'entrance',
      grade: initial?.grade || '',
      source: initial?.source || 'webcam',
      sourceConfig: initial?.sourceConfig || DEFAULT_SOURCE_CONFIG.webcam,
    },
  });

  const [source, setSource] = useState(initial?.source || 'webcam');
  const [config, setConfig] = useState(initial?.sourceConfig || DEFAULT_SOURCE_CONFIG.webcam);

  useEffect(() => {
    if (!isOpen) return undefined;
    reset({
      cameraId: initial?.cameraId || generateCameraId(),
      name: initial?.name || '',
      description: initial?.description || '',
      location: initial?.location || '',
      cameraType: initial?.cameraType || 'entrance',
      grade: initial?.grade || '',
      source: initial?.source || 'webcam',
    });
    setSource(initial?.source || 'webcam');
    setConfig(initial?.sourceConfig || DEFAULT_SOURCE_CONFIG.webcam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initial?._id, reset]);

  const handleSourceChange = (newSource) => {
    setSource(newSource);
    setConfig(DEFAULT_SOURCE_CONFIG[newSource]);
    setValue('source', newSource);
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      source,
      sourceConfig: config,
    };
    if (isEdit) {
      await cameraService.update(initial._id, payload);
    } else {
      await cameraService.create(payload);
    }
    onSaved?.();
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Editar cámara ${initial.cameraId}` : 'Nueva cámara'}
      description="Configura el origen, ubicación y tipo de la cámara."
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ID de cámara"
          required
          disabled={isEdit}
          helper={
            isEdit
              ? 'No se puede modificar'
              : 'Se genera automáticamente. Puedes editarlo si lo necesitas.'
          }
          error={errors.cameraId?.message}
          rightIcon={
            !isEdit ? (
              <button
                type="button"
                onClick={() => setValue('cameraId', generateCameraId(), { shouldValidate: true })}
                className="text-on-surface-variant hover:text-secondary transition-colors"
                aria-label="Regenerar ID"
                title="Regenerar ID"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            ) : null
          }
          {...register('cameraId', {
            required: 'Requerido',
            maxLength: { value: 40, message: 'Máximo 40 caracteres' },
            pattern: {
              value: /^[A-Za-z0-9_-]+$/,
              message: 'Solo letras, números, guion y guion bajo',
            },
          })}
        />
        <Input
          label="Nombre"
          placeholder="Cámara Entrada Norte"
          error={errors.name?.message}
          {...register('name', { maxLength: { value: 60, message: 'Máximo 60 caracteres' } })}
        />
        <Input
          label="Ubicación"
          placeholder="Acceso Norte"
          error={errors.location?.message}
          {...register('location', { maxLength: { value: 80, message: 'Máximo 80 caracteres' } })}
        />
        <Select label="Tipo" options={CAMERA_TYPES} {...register('cameraType')} />
        <div className="md:col-span-2">
          <Textarea
            label="Descripción"
            rows={2}
            placeholder="Notas internas sobre esta cámara"
            {...register('description', {
              maxLength: { value: 200, message: 'Máximo 200 caracteres' },
            })}
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-2">
          <p className="font-label text-[11px] text-on-surface-variant ml-1">Fuente de video</p>
          <CameraSourceSelector value={source} onChange={handleSourceChange} />
          <input type="hidden" {...register('source')} />
        </div>

        <div className="md:col-span-2">
          <CameraSourceFields source={source} config={config} onChange={setConfig} />
        </div>

        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 rounded-md text-on-surface-variant hover:bg-amber-400/10 font-label text-[11px] transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Crear cámara'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CameraForm;
