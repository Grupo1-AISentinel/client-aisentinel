import Badge from '../ui/Badge.jsx';

const variantByType = {
  string: 'default',
  number: 'info',
  boolean: 'secondary',
  date: 'info',
  objectId: 'default',
  array: 'warning',
  enum: 'success',
  mixed: 'default',
};

export const buildSchemaColumns = ({ withDefault = true, withConstraints = true } = {}) => {
  const cols = [
    {
      key: 'name',
      header: 'Campo',
      width: '180px',
      render: (row) => (
        <span className="font-mono text-amber-300/90 text-[12.5px]">{row.name}</span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      width: '110px',
      render: (row) => (
        <Badge size="sm" variant={variantByType[row.typeVariant] || 'default'}>
          {row.type}
        </Badge>
      ),
    },
    {
      key: 'required',
      header: 'Req.',
      width: '60px',
      render: (row) =>
        row.required ? (
          <Badge size="sm" variant="error">
            sí
          </Badge>
        ) : (
          <span className="text-on-surface-dim text-xs">no</span>
        ),
    },
  ];
  if (withDefault) {
    cols.push({
      key: 'defaultValue',
      header: 'Por defecto',
      width: '140px',
      render: (row) =>
        row.defaultValue ? (
          <code className="text-[11.5px] text-on-surface-variant bg-white/5 px-1.5 py-0.5 rounded">
            {row.defaultValue}
          </code>
        ) : (
          <span className="text-on-surface-dim text-xs">—</span>
        ),
    });
  }
  cols.push({
    key: 'description',
    header: 'Descripción',
    render: (row) => (
      <div className="space-y-1">
        <p className="text-on-surface text-[13px] leading-relaxed">{row.description}</p>
        {withConstraints && row.constraints && (
          <p className="text-[11px] text-on-surface-dim leading-relaxed">{row.constraints}</p>
        )}
      </div>
    ),
  });
  return cols;
};
