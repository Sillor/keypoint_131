import React from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

interface Deliverable {
  id: number;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  timeSpent: string;
  progress: string;
  status: string;
}

interface DeliverablesTableProps {
  data: Deliverable[];
  sortConfig: { key: keyof Deliverable | ''; direction: 'asc' | 'desc' };
  onSort: (key: keyof Deliverable) => void;
}

const DeliverablesTable: React.FC<DeliverablesTableProps> = ({
  data,
  onSort,
}) => {
  const router = useRouter();

  const columns: ColumnDef<Deliverable>[] = [
    { accessorKey: 'id', header: 'No.' },
    { accessorKey: 'name', header: 'Deliverable' },
    { accessorKey: 'category', header: 'Category / Project' },
    { accessorKey: 'startDate', header: 'Start Date' },
    { accessorKey: 'endDate', header: 'End Date' },
    { accessorKey: 'timeSpent', header: 'Time Spent' },
    { accessorKey: 'progress', header: 'Progress Achieved' },
    { accessorKey: 'status', header: 'Status' },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (id: number) => {
    router.push(`./deliverables/${id}`);
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
                    onClick={() => onSort(header.id as keyof Deliverable)}
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
              <tr
                key={row.id}
                className="border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(row.original.id)}
              >
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

export default DeliverablesTable;
