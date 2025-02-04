'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

interface Deliverable {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: string;
  category: string;
  timeSpent: string;
  status: string;
}

const DeliverableDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const details: Deliverable[] = [
    {
      id: '1.1',
      name: 'Task 1',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '34%',
      category: 'Development',
      timeSpent: '5 hours',
      status: 'In Progress',
    },
    {
      id: '1.2',
      name: 'Task 2',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '50%',
      category: 'Design',
      timeSpent: '8 hours',
      status: 'In Progress',
    },
    {
      id: '1.3',
      name: 'Task 3',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '100%',
      category: 'Testing',
      timeSpent: '12 hours',
      status: 'Completed',
    },
  ];

  const columns = [
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
    data: details,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Details for Deliverable {id}
        </h1>

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
                          <span>
                            {typeof header.column.columnDef.header ===
                            'function'
                              ? header.column.columnDef.header(
                                  header.getContext()
                                )
                              : header.column.columnDef.header}
                          </span>
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
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverableDetails;
