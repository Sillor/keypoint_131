import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

interface KPI {
  id: string | number;
  category: string;
  kpiId: number;
  kpi: string;
  description: string;
  target: string | number;
  uom: string;
  frequency: string;
  status: string;
}

interface KPITableProps {
  data: KPI[];
  handleEdit: (id: string | number, key: keyof KPI, value: string) => void;
}

const KPITable: React.FC<KPITableProps> = ({ data, handleEdit }) => {
  const [editingCell, setEditingCell] = useState<{
    rowId: string | number;
    column: keyof KPI;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string | number>('');

  const handleCellClick = (
    rowId: string | number,
    column: keyof KPI,
    value: string | number
  ) => {
    setEditingCell({ rowId, column });
    setTempValue(value ?? '');
  };

  const handleSave = () => {
    if (!editingCell) return;
    handleEdit(editingCell.rowId, editingCell.column, tempValue.toString());
    setEditingCell(null);
  };

  const columns: ColumnDef<KPI>[] = (
    [
      'category',
      'kpiId',
      'kpi',
      'description',
      'target',
      'uom',
      'frequency',
      'status',
    ] as (keyof KPI)[]
  ).map((columnKey) => ({
    accessorKey: columnKey,
    header: columnKey.charAt(0).toUpperCase() + columnKey.slice(1),
    cell: ({ row }) => {
      const cellValue = row.original[columnKey];
      const isEditing =
        editingCell?.rowId === row.original.id &&
        editingCell?.column === columnKey;

      return isEditing ? (
        <input
          type="text"
          className="w-full border border-gray-300 rounded p-1"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
        />
      ) : (
        <span
          className="cursor-pointer"
          onClick={() => handleCellClick(row.original.id, columnKey, cellValue)}
        >
          {cellValue || '—'}
        </span>
      );
    },
  }));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-lg">
      <div className="overflow-x-auto max-h-[500px] scrollbar-hide">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="sticky top-0 bg-gray-800 text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-sm font-semibold cursor-pointer select-none"
                  >
                    {header.column.columnDef.header as string}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-100">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-3 border border-gray-300"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KPITable;
