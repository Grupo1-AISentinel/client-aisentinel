import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DatabaseIcon,
  ServerIcon,
  LayersIcon,
} from '../../../../shared/components/docs/index.js';
import Card, { CardHeader } from '../../../../shared/components/ui/Card.jsx';
import Badge from '../../../../shared/components/ui/Badge.jsx';
import { SchemaTable, buildSchemaColumns } from '../../../../shared/components/docs/index.js';
import { dataModels } from '../../data/dataModels.js';
import { cn } from '../../../../shared/utils/cn.js';

const ModelItem = ({ model }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center justify-between gap-3 p-3 text-left transition-colors',
          open ? 'bg-amber-400/5' : 'bg-white/[0.02] hover:bg-white/[0.04]'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {open ? (
            <ChevronDownIcon className="w-4 h-4 text-on-surface-dim shrink-0" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-on-surface-dim shrink-0" />
          )}
          <code className="font-mono text-amber-300 text-[13px]">{model.name}</code>
          <Badge size="sm" variant="default">
            {model.fields.length} campos
          </Badge>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/70">
          {open ? 'Cerrar' : 'Ver'}
        </span>
      </button>
      {open && (
        <div className="p-3 space-y-3 border-t border-white/5">
          <p className="text-[12.5px] text-on-surface-variant leading-relaxed">
            {model.description}
          </p>
          <SchemaTable
            columns={buildSchemaColumns()}
            rows={model.fields.map((f) => ({
              name: f.name,
              type: f.type,
              typeVariant: f.typeVariant,
              required: f.required,
              defaultValue: f.defaultValue,
              description: f.description,
              constraints: f.constraints,
            }))}
          />
          {model.indexes && model.indexes.length > 0 && (
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-amber-300/80 mb-1.5">
                Índices
              </p>
              <div className="flex flex-wrap gap-1.5">
                {model.indexes.map((idx, i) => (
                  <code
                    key={i}
                    className="text-[11.5px] font-mono text-on-surface-variant bg-white/5 px-2 py-0.5 rounded border border-white/5"
                  >
                    {idx}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Group = ({ icon: Icon, title, description, models }) => (
  <Card>
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-amber-300" />
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-base font-bold text-on-surface">{title}</h3>
        <p className="text-[12px] text-on-surface-variant mt-0.5">{description}</p>
      </div>
    </div>
    <div className="space-y-2">
      {models.map((m) => (
        <ModelItem key={m.name} model={m} />
      ))}
    </div>
  </Card>
);

const DataModelsSection = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader
        title="Modelos de datos"
        description="Esquemas de MongoDB (Mongoose), PostgreSQL (Sequelize) y ChromaDB."
      />
      <p className="text-sm text-on-surface-variant leading-relaxed">
        MongoDB (Mongoose) es la persistencia principal del Admin. PostgreSQL (Sequelize) es
        exclusiva del Auth. ChromaDB es la base vectorial donde Pyimage persiste embeddings faciales
        y de uniformes.
      </p>
    </Card>
    <Group
      icon={DatabaseIcon}
      title={dataModels.mongodb.title}
      description={dataModels.mongodb.description}
      models={dataModels.mongodb.models}
    />
    <Group
      icon={ServerIcon}
      title={dataModels.postgresql.title}
      description={dataModels.postgresql.description}
      models={dataModels.postgresql.models}
    />
    <Group
      icon={LayersIcon}
      title={dataModels.chromadb.title}
      description={dataModels.chromadb.description}
      models={dataModels.chromadb.models}
    />
  </div>
);

export default DataModelsSection;
