import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Upload } from 'lucide-react';
import { Modal, ModalFooter, Button, Input, Select } from '../../../shared/components/ui/index.js';
import useModels3DStore, { SLOT_LABELS, SLOT_ORDER } from '../stores/models3dStore.js';

const SLOT_OPTIONS = SLOT_ORDER.map((slot) => ({
  value: slot,
  label: SLOT_LABELS[slot],
}));

const UploadModelModal = ({ open, onClose, defaultSlot }) => {
  const uploadGarment = useModels3DStore((s) => s.uploadGarment);
  const uploading = useModels3DStore((s) => s.uploading);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  useEffect(() => {
    if (open) {
      reset({ name: '', displayName: '', slot: defaultSlot || 'outerwear', era: '', file: null });
      if (defaultSlot) setValue('slot', defaultSlot);
    }
  }, [open, defaultSlot, reset, setValue]);

  const onSubmit = async (values) => {
    const fileList = values.file;
    const file = fileList && fileList[0];
    if (!file) return;
    try {
      await uploadGarment({
        name: values.name,
        displayName: values.displayName,
        slot: values.slot,
        era: values.era || undefined,
        file,
      });
      onClose();
    } catch {
      /* el store ya muestra el toast de error */
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Subir modelo 3D" size="md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-label text-on-surface-variant">
              Archivo .glb <span className="text-error">*</span>
            </label>
            <input
              type="file"
              accept=".glb,model/gltf-binary"
              {...register('file', { required: 'El archivo es requerido' })}
              className="text-sm text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-secondary-bright file:text-surface-container file:font-semibold file:cursor-pointer"
            />
            {errors.file && <p className="text-xs text-error">{errors.file.message}</p>}
            <p className="font-label text-[10px] text-on-surface-variant">
              El .glb debe estar rigged al esqueleto HUMANOID de Rigify (prefijo DEF-).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nombre (slug)"
              required
              placeholder="chumpa-2010"
              error={errors.name?.message}
              {...register('name', {
                required: 'Requerido',
                maxLength: 80,
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Solo minusculas, numeros y guiones',
                },
              })}
            />
            <Input
              label="Nombre visible"
              required
              placeholder="Chumpa edicion 2010"
              error={errors.displayName?.message}
              {...register('displayName', { required: 'Requerido', maxLength: 120 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Slot"
              required
              options={SLOT_OPTIONS}
              error={errors.slot?.message}
              {...register('slot', { required: 'Selecciona un slot' })}
            />
            <Input
              label="Era (opcional)"
              placeholder="2010"
              error={errors.era?.message}
              {...register('era', { maxLength: 20 })}
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={uploading}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Subir modelo
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default UploadModelModal;
