import { cn } from '../../utils/cn.js';

const SchemaTable = ({ columns, rows, className }) => (
  <div className={cn('overflow-x-auto rounded-md border border-white/10', className)}>
    <table className="w-full text-sm">
      <thead className="bg-white/[0.03] border-b border-white/10">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-3 py-2 text-left font-label tracking-wide text-[10px] uppercase text-on-surface-dim"
              style={col.width ? { width: col.width } : undefined}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
            {columns.map((col) => (
              <td key={col.key} className="px-3 py-2 align-top text-on-surface">
                {col.render ? col.render(row) : (row[col.key] ?? '—')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SchemaTable;
