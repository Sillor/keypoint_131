'use client';

import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import DropdownFilter from '../../../components/DropdownFilter';
import Table from '../../../components/Table';

const DeliverableDetails = () => {
  const { id } = useParams();

  const [details] = useState([
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
    {
      id: '1.4',
      name: 'Task 4',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '75%',
      category: 'Development',
      timeSpent: '6 hours',
      status: 'In Progress',
    },
    {
      id: '1.5',
      name: 'Task 5',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '20%',
      category: 'Marketing',
      timeSpent: '3 hours',
      status: 'Delayed',
    },
    {
      id: '1.6',
      name: 'Task 6',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '65%',
      category: 'Analysis',
      timeSpent: '7 hours',
      status: 'In Progress',
    },
    {
      id: '1.7',
      name: 'Task 7',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '90%',
      category: 'Design',
      timeSpent: '10 hours',
      status: 'In Progress',
    },
    {
      id: '1.8',
      name: 'Task 8',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '45%',
      category: 'Documentation',
      timeSpent: '4 hours',
      status: 'Pending',
    },
    {
      id: '1.9',
      name: 'Task 9',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '100%',
      category: 'Testing',
      timeSpent: '15 hours',
      status: 'Completed',
    },
    {
      id: '1.10',
      name: 'Task 10',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '25%',
      category: 'Research',
      timeSpent: '5 hours',
      status: 'In Progress',
    },
    {
      id: '1.11',
      name: 'Task 11',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '80%',
      category: 'Development',
      timeSpent: '20 hours',
      status: 'In Progress',
    },
    {
      id: '1.12',
      name: 'Task 12',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '15%',
      category: 'Design',
      timeSpent: '2 hours',
      status: 'Delayed',
    },
    {
      id: '1.13',
      name: 'Task 13',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '55%',
      category: 'Documentation',
      timeSpent: '6 hours',
      status: 'In Progress',
    },
    {
      id: '1.14',
      name: 'Task 14',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '10%',
      category: 'Research',
      timeSpent: '3 hours',
      status: 'Pending',
    },
    {
      id: '1.15',
      name: 'Task 15',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '100%',
      category: 'Testing',
      timeSpent: '18 hours',
      status: 'Completed',
    },
    {
      id: '1.16',
      name: 'Task 16',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '70%',
      category: 'Development',
      timeSpent: '8 hours',
      status: 'In Progress',
    },
    {
      id: '1.17',
      name: 'Task 17',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '40%',
      category: 'Analysis',
      timeSpent: '5 hours',
      status: 'In Progress',
    },
    {
      id: '1.18',
      name: 'Task 18',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '95%',
      category: 'Documentation',
      timeSpent: '12 hours',
      status: 'In Progress',
    },
    {
      id: '1.19',
      name: 'Task 19',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '30%',
      category: 'Design',
      timeSpent: '4 hours',
      status: 'Delayed',
    },
    {
      id: '1.20',
      name: 'Task 20',
      startDate: '2023-11-14',
      endDate: '2023-12-20',
      progress: '100%',
      category: 'Testing',
      timeSpent: '15 hours',
      status: 'Completed',
    },
  ]);

  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof (typeof details)[0] | '';
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });

  const filteredDetails = details.filter((item) =>
    statusFilter ? item.status === statusFilter : true
  );

  const sortedDetails = [...filteredDetails].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key as keyof typeof a] || '';
    const bValue = b[sortConfig.key as keyof typeof b] || '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof (typeof details)[0]) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const headers: { key: 'id' | 'name' | 'startDate' | 'endDate' | 'progress' | 'category' | 'timeSpent' | 'status'; label: string }[] = [
    { key: 'id', label: 'No.' },
    { key: 'name', label: 'Deliverable' },
    { key: 'category', label: 'Category / Project' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'timeSpent', label: 'Time Spent' },
    { key: 'progress', label: 'Progress Achieved' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Details for Deliverable {id}
        </h1>

        {/* Dropdown Filters */}
        <div className="flex gap-4 mb-6">
          <DropdownFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={['Completed', 'In Progress', 'Pending']}
            label="All Status"
          />
        </div>

        {/* Table */}
        <Table
          data={sortedDetails}
          headers={headers}
          sortConfig={sortConfig}
          onSort={handleSort}
          clickable={false}
        />
      </div>
    </div>
  );
};

export default DeliverableDetails;
