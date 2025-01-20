import React from 'react';
import { useRouter } from 'next/navigation';
import Table from './Table';

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
  sortConfig,
  onSort,
}) => {
  const router = useRouter();

  const headers: { key: keyof Deliverable; label: string }[] = [
    { key: 'id', label: 'No.' },
    { key: 'name', label: 'Deliverable' },
    { key: 'category', label: 'Category / Project' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'timeSpent', label: 'Time Spent' },
    { key: 'progress', label: 'Progress Achieved' },
    { key: 'status', label: 'Status' },
  ];

  const handleRowClick = (id: string | number) => {
    router.push(`./deliverables/${id}`);
  };

  return (
    <Table
      data={data}
      headers={headers}
      sortConfig={sortConfig}
      onSort={onSort}
      clickable={true}
      onRowClick={handleRowClick}
    />
  );
};

export default DeliverablesTable;
