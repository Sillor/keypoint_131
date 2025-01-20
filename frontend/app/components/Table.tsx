import React from 'react';
import TableCell from './TableCell';
import SortAscIcon from './SortAscIcon';
import SortDescIcon from './SortDescIcon';

interface SortConfig {
  key: string | '';
  direction: 'asc' | 'desc';
}

interface TableProps<T> {
  data: T[];
  headers: { key: keyof T; label: string }[];
  sortConfig: SortConfig;
  onSort: (key: keyof T) => void;
  clickable?: boolean;
  onRowClick?: (id: number | string) => void;
}

const Table = <T extends { id: number | string }>({
  data,
  headers,
  sortConfig,
  onSort,
  clickable = false,
  onRowClick,
}: TableProps<T>) => {
  const renderSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  const handleRowClick = (id: number | string) => {
    if (clickable && onRowClick) {
      onRowClick(id);
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
            {data.map((row) => (
              <tr
                key={row.id}
                className={`border-b ${
                  clickable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => handleRowClick(row.id)}
              >
                {headers.map((header) => (
                  <TableCell key={String(header.key)}>
                    {row[header.key] as React.ReactNode}
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
