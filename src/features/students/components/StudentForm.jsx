import { Controller } from 'react-hook-form';
import { Input, Select, Button } from '../../../shared/components/ui/index.js';
import { GRADES } from '../../../shared/utils/constants.js';
import { isEmail, isIdCard, isRequired } from '../../../shared/validators/validators.js';

const StudentForm = ({
  form,
  onSubmit,
  onCancel,
  loading,
  isCoordinator,
  submitLabel = 'Crear estudiante',
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      noValidate
    >
      <Input
        label="Nombre"
        required
        placeholder="María"
        error={errors.studentName?.message}
        {...register('studentName', {
          required: 'El nombre es requerido',
          maxLength: { value: 50, message: 'Máximo 50 caracteres' },
        })}
      />
      <Input
        label="Apellido"
        required
        placeholder="García"
        error={errors.studentSurname?.message}
        {...register('studentSurname', {
          required: 'El apellido es requerido',
          maxLength: { value: 50, message: 'Máximo 50 caracteres' },
        })}
      />
      <Input
        label="Correo"
        type="email"
        required
        placeholder="maria@kinal.edu.gt"
        error={errors.email?.message}
        {...register('email', {
          required: 'El correo es requerido',
          validate: (v) => isEmail(v) || 'Correo no válido',
        })}
      />
      <Input
        label="Carnet"
        required
        placeholder="1234567"
        error={errors.idCard?.message}
        {...register('idCard', {
          required: 'El carnet es requerido',
          validate: (v) => isIdCard(v) || 'El carnet debe tener entre 6 y 7 dígitos',
        })}
      />
      <Controller
        name="grade"
        control={control}
        rules={{ required: 'Selecciona un grado', validate: isRequired }}
        render={({ field, fieldState }) => (
          <Select
            label="Grado"
            required
            disabled={isCoordinator}
            options={GRADES.map((g) => ({ value: g, label: g }))}
            value={field.value || ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="photos"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-label text-on-surface-variant">
              Fotos de referencia (mín. 3)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => field.onChange(Array.from(e.target.files || []))}
              className="text-sm text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-secondary-bright file:text-surface-container file:font-semibold file:cursor-pointer"
            />
            {field.value?.length > 0 && (
              <p className="text-xs text-on-surface-dim">
                {field.value.length} archivo(s) seleccionado(s)
              </p>
            )}
          </div>
        )}
      />
      <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
