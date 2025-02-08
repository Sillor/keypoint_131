import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import TableCell from './TableCell';

interface TableProps<T> {
  data: T[];
  headers: { key: keyof T; label: string; editable?: boolean }[];
  onEdit: (id: number | string, key: keyof T, value: string) => void;
  onRemove: (id: number | string) => void;
  clickable?: boolean;
  renderCell?: (item: T, key: keyof T) => React.ReactNode;
  onRowClick?: (id: number | string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  showRouteButton?: boolean;
  routeBasePath?: string;
}

const Table = <T extends { id: number | string }>({
  data,
  headers,
  onRemove,
  clickable,
  onRowClick,
  renderCell = (item: T, key: keyof T) => item[key] as React.ReactNode,
  onEdit,
  onKeyDown,
  showRouteButton = false,
  routeBasePath = 'route',
}: TableProps<T>) => {
  const [editingRow, setEditingRow] = useState<number | string | null>(null);
  const router = useRouter();

  const columns: ColumnDef<T>[] = headers.map((header) => ({
    accessorKey: header.key,
    header: header.label,
  }));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (id: number | string) => {
    if (clickable && onRowClick) {
      onRowClick(id);
    }
    setEditingRow(id);
  };

  const handleEdit = (id: number | string, key: keyof T, value: string) => {
    onEdit(id, key, value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingRow(null);
    }
    if (onKeyDown) {
      onKeyDown(e);
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
                  className="px-6 py-3 text-sm font-semibold cursor-pointer select-none border border-gray-800"
                >
                  {header.label}
                </th>
              ))}
              <th className="px-6 py-3 text-sm font-semibold border border-gray-800">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => handleRowClick(row.original.id)}
              >
                {headers.map((header) => (
                  <TableCell
                    key={String(header.key)}
                    className="border border-gray-200"
                  >
                    {header.editable && editingRow === row.original.id ? (
                      <input
                        type="text"
                        value={
                          (row.original[header.key] as string | number) ?? ''
                        }
                        onChange={(e) =>
                          handleEdit(
                            row.original.id,
                            header.key,
                            e.target.value
                          )
                        }
                        onKeyDown={handleKeyDown}
                        className="w-full border border-gray-200 rounded p-1"
                      />
                    ) : (
                      renderCell(row.original, header.key)
                    )}
                  </TableCell>
                ))}
                <TableCell className="border border-gray-200 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(row.original.id);
                    }}
                    className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>

                  {showRouteButton && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${routeBasePath}/${row.original.id}`);
                      }}
                      className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      ↪️
                    </button>
                  )}
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
