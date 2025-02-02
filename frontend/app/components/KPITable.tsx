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
    row: KPI;
    column: keyof KPI;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string | number>('');

  const columns: ColumnDef<KPI>[] = [
    { accessorFn: (row) => row.category, header: 'Category' },
    { accessorFn: (row) => row.kpiId, header: 'ID' },
    { accessorFn: (row) => row.kpi, header: 'KPI' },
    { accessorFn: (row) => row.description, header: 'Description' },
    { accessorFn: (row) => row.target, header: 'Target' },
    { accessorFn: (row) => row.uom, header: 'UoM' },
    { accessorFn: (row) => row.frequency, header: 'Frequency' },
    { accessorFn: (row) => row.status, header: 'Status' },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCellClick = (row: KPI, column: keyof KPI) => {
    if (!['category', 'target', 'status'].includes(column)) return;
    setEditingCell({ row, column });
    setTempValue(row[column]);
  };

  const handleSave = () => {
    if (editingCell) {
      handleEdit(editingCell.row.id, editingCell.column, tempValue.toString());
      setEditingCell(null);
    }
  };

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
                    <div className="flex items-center justify-start gap-2">
                      <span>{header.column.columnDef.header as string}</span>
                    </div>
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
                    onClick={() =>
                      handleCellClick(row.original, cell.column.id as keyof KPI)
                    }
                  >
                    {editingCell?.row.id === row.original.id &&
                    editingCell?.column === (cell.column.id as keyof KPI) ? (
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
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
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
