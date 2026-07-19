import { useRef } from 'react';
import { cn } from '../../utils/cn.js';
import Skeleton from './Skeleton.jsx';

const Table = ({ columns, rows, loading, emptyState, onRowClick, striped = false, className }) => {
  const tableRef = useRef(null);

  return (
    <div
      className={cn('w-full rounded-xl overflow-hidden border', className)}
      style={{
        backgroundColor: 'var(--color-table-surface)',
        borderColor: 'var(--color-table-border)',
      }}
    >
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full text-sm">
          <thead
            className="border-b-2"
            style={{
              backgroundColor: 'var(--color-table-header-bg)',
              borderColor: 'var(--color-outline-border, var(--color-table-divider))',
            }}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'sticky top-0 px-4 py-3 text-left font-label tracking-wide text-[10px] uppercase',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.width && `w-[${col.width}]`
                  )}
                  style={{
                    color: 'var(--color-table-header-text)',
                    ...(col.width ? { width: col.width } : {}),
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={`sk-${i}`}
                  className="border-t"
                  style={{ borderColor: 'var(--color-table-divider)' }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows?.length ? (
              rows.map((row, rowIndex) => {
                const isStriped = striped && rowIndex % 2 === 1;
                return (
                  <tr
                    key={row.id || rowIndex}
                    className={cn(
                      'border-t transition-colors duration-150',
                      onRowClick && 'cursor-pointer'
                    )}
                    style={{
                      borderColor: 'var(--color-table-divider)',
                      backgroundColor: isStriped ? 'var(--color-table-row-stripe)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (onRowClick) {
                        e.currentTarget.style.backgroundColor = 'var(--color-table-row-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isStriped
                        ? 'var(--color-table-row-stripe)'
                        : 'transparent';
                    }}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-on-surface',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center'
                        )}
                      >
                        {col.render ? col.render(row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  {emptyState || <span className="text-sm text-on-surface-dim">Sin registros</span>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
