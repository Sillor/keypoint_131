import React from 'react';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

interface Project {
  id: number;
  name: string;
  category: string;
  status: string;
}

interface ProjectsTableProps {
  data: Project[];
  onNavigate: (id: number) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ data, onNavigate }) => {
  const columns: ColumnDef<Project>[] = [
    { accessorKey: 'id', header: 'No.' },
    { accessorKey: 'name', header: 'Project' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'status', header: 'Status' },
  ];

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
                    className="px-6 py-3 text-sm font-semibold select-none"
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
                key={row.id}
                className="border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => onNavigate(row.original.id)}
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

export default ProjectsTable;
