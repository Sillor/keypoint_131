import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

interface KPITableProps {
  data: KPI[];

  handleEdit: (id: number, key: keyof KPI, value: string) => void;

  handleAddKPI: (newKPI: KPI) => void;
}

interface KPI {
  id: number;
  kpiId: number;
  user_id?: number;
  category: string;
  kpi: string;
  description: string;
  target: number | string;
  uom: string;
  frequency: string;
  status: string;
}

const createKPI = async (newKPI: KPI) => {
  try {
    const response = await fetch('http://localhost:3333/kpi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        category: newKPI.category,
        kpi: '',
        description: '',
        target: 0,
        uom: '',
        frequency: '',
        status: '',
      }),
    });

    const createdKPI = await response.json();
    return createdKPI;
  } catch (error) {
    console.error('Error creating KPI:', error);
  }
};

const KPITable: React.FC<KPITableProps> = ({
  data,
  handleEdit,
  handleAddKPI,
}) => {
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

  const handleSave = async () => {
    if (!editingCell) return;

    const { rowId, column } = editingCell;
    const newValue = tempValue.toString();

    handleEdit(Number(rowId), column, newValue);
    await updateDatabase(Number(rowId), column, newValue);

    setEditingCell(null);
  };

  const handleAddNewKPI = async () => {
    const newKPI: KPI = {
      id: Date.now(),
      category: '',
      kpiId: data.length + 1,
      kpi: '',
      description: '',
      target: '',
      uom: '',
      frequency: '',
      status: '',
    };

    const createdKPI = await createKPI(newKPI);
    if (createdKPI) {
      handleAddKPI(createdKPI);
    }
  };

  const columns: ColumnDef<KPI>[] = (
    [
      'id',
      'category',
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
          onClick={() =>
            handleCellClick(row.original.id, columnKey, cellValue ?? '')
          }
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
      <button
        className="mb-2 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleAddNewKPI}
      >
        Add KPI
      </button>
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
              <tr
                key={row.original.id ?? row.index}
                className="border-b hover:bg-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={`${row.original.id}-${cell.column.id}`}
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
const updateDatabase = async (id: number, column: keyof KPI, value: string) => {
  try {
    const response = await fetch(`http://localhost:3333/kpi/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ [column]: value }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update KPI. Server responded with ${response.status}`
      );
    }

    const updatedKPI = await response.json();
    return updatedKPI;
  } catch (error) {
    console.error('Error updating KPI:', error);
  }
};
