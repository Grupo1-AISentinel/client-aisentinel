import { useNavigate } from 'react-router';
import { useState, useRef } from 'react';
import { Upload, X, ImagePlus } from 'lucide-react';
import PageHeader from '../../../shared/components/layout/PageHeader.jsx';
import { Card, Input, Select, Button } from '../../../shared/components/ui/index.js';
import { uniformService } from '../services/uniformService.js';
import { UNIFORM_TYPES, UNIFORM_TYPE_LABELS } from '../../../shared/utils/constants.js';
import toast from 'react-hot-toast';
import { cn } from '../../../shared/utils/cn.js';

const MIN_IMAGES = 3;
const MAX_IMAGES = 8;

const UniformCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [previews, setPreviews] = useState([]);
  const [imagesError, setImagesError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const fileInputRef = useRef(null);
  const filesRef = useRef([]);

  const addFiles = (newFiles) => {
    const accepted = Array.from(newFiles).filter((f) => f.type.startsWith('image/'));
    const next = [...filesRef.current, ...accepted].slice(0, MAX_IMAGES);
    filesRef.current = next;
    setPreviews(next.map((f) => ({ url: URL.createObjectURL(f), name: f.name })));
    setImagesError(null);
  };

  const removeImage = (index) => {
    const next = filesRef.current.filter((_, i) => i !== index);
    filesRef.current = next;
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]?.url || '');
      return next.map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newNameError = name.trim() ? null : 'Requerido';
    const newTypeError = type ? null : 'Selecciona un tipo';
    const newImagesError =
      filesRef.current.length >= MIN_IMAGES ? null : `Minimo ${MIN_IMAGES} imagenes`;
    setNameError(newNameError);
    setTypeError(newTypeError);
    setImagesError(newImagesError);
    if (newNameError || newTypeError || newImagesError) return;

    setLoading(true);
    uniformService
      .create({
        name: name.trim(),
        type,
        images: filesRef.current,
      })
      .then(() => {
        toast.success(
          `Uniforme creado. Python generara el embedding con ${filesRef.current.length} imagenes.`
        );
        navigate('/uniforms');
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <PageHeader
        title="Nuevo uniforme"
        description={`Registra una prenda de referencia con minimo ${MIN_IMAGES} imagenes para generar el embedding.`}
      />
      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" noValidate>
          <Input
            label="Nombre"
            required
            placeholder="Camisa blanca manga corta"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            maxLength={80}
          />
          <Select
            label="Tipo"
            required
            options={UNIFORM_TYPES.map((t) => ({
              value: t,
              label: UNIFORM_TYPE_LABELS[t],
            }))}
            value={type}
            onChange={(e) => setType(e.target.value)}
            error={typeError}
          />

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-label text-on-surface-variant">
              Imagenes de referencia <span className="text-error">*</span>
              <span className="text-on-surface-dim ml-2 font-mono text-xs">
                ({previews.length}/{MAX_IMAGES}) - minimo {MIN_IMAGES}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {previews.map((p, i) => (
                <div
                  key={p.url}
                  className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group"
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-surface-container/90 text-on-surface hover:bg-error-bright hover:text-surface-container transition-colors"
                    aria-label={`Quitar ${p.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {previews.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'aspect-square rounded-lg border-2 border-dashed border-white/15',
                    'flex flex-col items-center justify-center gap-1.5',
                    'text-on-surface-variant hover:text-amber-300 hover:border-amber-400/40',
                    'transition-colors bg-surface-container-lowest/40'
                  )}
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="font-label text-[10px] uppercase tracking-wider">Agregar</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = '';
              }}
            />

            {imagesError && <p className="text-xs text-error font-mono">{imagesError}</p>}

            <p className="text-[10px] text-on-surface-dim font-mono mt-1">
              JPG, PNG o WebP. Las imagenes se envian a Python para generar el embedding de la
              prenda (DINOv2 + ChromaDB).
            </p>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => navigate('/uniforms')}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={previews.length < MIN_IMAGES}
            >
              <Upload className="w-4 h-4 mr-1" />
              Guardar uniforme
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UniformCreatePage;
