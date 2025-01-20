import React from 'react';
import TableCell from './TableCell';
import SortAscIcon from './SortAscIcon';
import SortDescIcon from './SortDescIcon';

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

interface SortConfig {
  key: keyof Deliverable | '';
  direction: 'asc' | 'desc';
}

interface DeliverablesTableProps {
  data: Deliverable[];
  sortConfig: SortConfig;
  onSort: (key: keyof Deliverable) => void;
}

const DeliverablesTable: React.FC<DeliverablesTableProps> = ({
  data,
  sortConfig,
  onSort,
}) => {
  const headers = [
    { key: 'id', label: 'No.' },
    { key: 'name', label: 'Deliverable' },
    { key: 'category', label: 'Category / Project' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'timeSpent', label: 'Time Spent' },
    { key: 'progress', label: 'Progress Achieved' },
    { key: 'status', label: 'Status' },
  ];

  const renderSortIcon = (key: keyof Deliverable) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  return (
    <div className="overflow-hidden rounded-lg">
      {/* Scrollable container with hidden scrollbar */}
      <div className="overflow-x-auto max-h-[500px] scrollbar-hide">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="sticky top-0 bg-gray-800 text-white">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className="px-6 py-3 text-sm font-semibold cursor-pointer select-none"
                  onClick={() => onSort(header.key as keyof Deliverable)}
                >
                  <div className="flex items-center justify-start gap-2">
                    <span>{header.label}</span>
                    {renderSortIcon(header.key as keyof Deliverable)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b">
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.startDate}</TableCell>
                <TableCell>{row.endDate}</TableCell>
                <TableCell>{row.timeSpent}</TableCell>
                <TableCell>{row.progress}</TableCell>
                <TableCell>{row.status}</TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliverablesTable;
