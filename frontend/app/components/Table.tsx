import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import SortAscIcon from './SortAscIcon';
import SortDescIcon from './SortDescIcon';
import TableCell from './TableCell';

interface SortConfig {
  key: string | '';
  direction: 'asc' | 'desc';
}

interface TableProps<T extends { id: number | string }> {
  data: T[];
  headers: { key: keyof T; label: string; editable?: boolean }[];
  sortConfig: SortConfig;
  onSort: (key: keyof T) => void;
  clickable?: boolean;
  onRowClick?: (id: number | string) => void;
  onEdit?: (id: number | string, key: keyof T, value: string) => void;
  renderCell?: (item: T, key: keyof T) => React.ReactNode;
}

const Table = <T extends { id: number | string }>({
  data,
  headers,
  sortConfig,
  onSort,
  clickable,
  onRowClick,
  renderCell = (item: T, key: keyof T) => item[key] as React.ReactNode,
  onEdit,
}: TableProps<T>) => {
  const columns: ColumnDef<T>[] = headers.map((header) => ({
    accessorKey: header.key,
    header: header.label,
  }));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  const handleRowClick = (id: number | string) => {
    if (clickable && onRowClick) {
      onRowClick(id);
    }
  };

  const handleEdit = (id: number | string, key: keyof T, value: string) => {
    if (onEdit) {
      onEdit(id, key, value);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg">
      <div className="overflow-x-auto max-h-[500px] scrollbar-hide">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="sticky top-0 bg-gray-800 text-white">
            <tr>
              {headers.map((header) => (
                <th
                  key={String(header.key)}
                  className="px-6 py-3 text-sm font-semibold cursor-pointer select-none"
                  onClick={() => onSort(header.key)}
                >
                  <div className="flex items-center justify-start gap-2">
                    <span>{header.label}</span>
                    {renderSortIcon(header.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b ${
                  clickable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => handleRowClick(row.original.id)}
              >
                {headers.map((header) => (
                  <TableCell key={String(header.key)}>
                    {header.editable ? (
                      <input
                        type="text"
                        value={row.original[header.key] as string}
                        onChange={(e) =>
                          handleEdit(
                            row.original.id,
                            header.key,
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded p-1"
                      />
                    ) : (
                      renderCell(row.original, header.key)
                    )}
                  </TableCell>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
