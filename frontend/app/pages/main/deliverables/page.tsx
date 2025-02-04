'use client';

import React, { useState } from 'react';
import SearchBar from '../../../components/SearchBar';
import DropdownFilter from '../../../components/DropdownFilter';
import DeliverablesTable from '../../../components/DeliverablesTable';

// Main Page Component
const Page = () => {
  const [tableData, setTableData] = useState([
    {
      id: 1,
      name: 'Build Landing Page',
      category: 'Web Development',
      startDate: '2023-01-02',
      endDate: '2023-01-05',
      timeSpent: '12 hours',
      progress: '100%',
      status: 'Completed',
    },
    {
      id: 2,
      name: 'Design Logo',
      category: 'Branding',
      startDate: '2023-01-10',
      endDate: '2023-01-12',
      timeSpent: '8 hours',
      progress: '100%',
      status: 'Completed',
    },
    {
      id: 3,
      name: 'Write Blog Content',
      category: 'Content Marketing',
      startDate: '2023-02-01',
      endDate: '2023-02-07',
      timeSpent: '10 hours',
      progress: '90%',
      status: 'In Progress',
    },
    {
      id: 4,
      name: 'Create Social Media Strategy',
      category: 'Marketing',
      startDate: '2023-02-10',
      endDate: '2023-02-20',
      timeSpent: '15 hours',
      progress: '75%',
      status: 'In Progress',
    },
    {
      id: 5,
      name: 'Develop Mobile App Prototype',
      category: 'App Development',
      startDate: '2023-03-01',
      endDate: '2023-03-20',
      timeSpent: '40 hours',
      progress: '60%',
      status: 'Delayed',
    },
    {
      id: 6,
      name: 'Conduct User Interviews',
      category: 'Research',
      startDate: '2023-03-15',
      endDate: '2023-03-22',
      timeSpent: '20 hours',
      progress: '100%',
      status: 'Completed',
    },
    {
      id: 7,
      name: 'Optimize SEO for Blog',
      category: 'SEO Optimization',
      startDate: '2023-04-05',
      endDate: '2023-04-10',
      timeSpent: '8 hours',
      progress: '95%',
      status: 'In Progress',
    },
    {
      id: 8,
      name: 'Set Up Analytics Dashboard',
      category: 'Data Analytics',
      startDate: '2023-04-15',
      endDate: '2023-04-20',
      timeSpent: '18 hours',
      progress: '85%',
      status: 'In Progress',
    },
    {
      id: 9,
      name: 'Plan Team Retreat',
      category: 'HR Initiatives',
      startDate: '2023-05-01',
      endDate: '2023-05-10',
      timeSpent: '5 hours',
      progress: '100%',
      status: 'Completed',
    },
    {
      id: 10,
      name: 'Run Facebook Ads Campaign',
      category: 'Advertising',
      startDate: '2023-05-15',
      endDate: '2023-05-30',
      timeSpent: '25 hours',
      progress: '65%',
      status: 'In Progress',
    },
    {
      id: 11,
      name: 'Prototype E-commerce Feature',
      category: 'Web Development',
      startDate: '2023-06-01',
      endDate: '2023-06-15',
      timeSpent: '35 hours',
      progress: '70%',
      status: 'In Progress',
    },
    {
      id: 12,
      name: 'Film Product Video',
      category: 'Video Production',
      startDate: '2023-06-20',
      endDate: '2023-06-25',
      timeSpent: '15 hours',
      progress: '100%',
      status: 'Completed',
    },
    {
      id: 13,
      name: 'Translate Website Content',
      category: 'Localization',
      startDate: '2023-07-01',
      endDate: '2023-07-05',
      timeSpent: '10 hours',
      progress: '50%',
      status: 'In Progress',
    },
    {
      id: 14,
      name: 'Launch Beta Program',
      category: 'Product Management',
      startDate: '2023-07-10',
      endDate: '2023-07-20',
      timeSpent: '30 hours',
      progress: '95%',
      status: 'In Progress',
    },
    {
      id: 15,
      name: 'Create Holiday Campaign',
      category: 'Seasonal Marketing',
      startDate: '2023-08-01',
      endDate: '2023-08-15',
      timeSpent: '25 hours',
      progress: '80%',
      status: 'In Progress',
    },
    {
      id: 16,
      name: 'Train New Hires',
      category: 'HR Training',
      startDate: '2023-08-20',
      endDate: '2023-08-25',
      timeSpent: '10 hours',
      progress: '100%',
      status: 'Completed',
    },
    {
      id: 17,
      name: 'Organize Charity Event',
      category: 'Community Outreach',
      startDate: '2023-09-01',
      endDate: '2023-09-10',
      timeSpent: '40 hours',
      progress: '50%',
      status: 'In Progress',
    },
    {
      id: 18,
      name: 'Debug Payment Gateway',
      category: 'App Maintenance',
      startDate: '2023-09-15',
      endDate: '2023-09-20',
      timeSpent: '20 hours',
      progress: '25%',
      status: 'Delayed',
    },
    {
      id: 19,
      name: 'Develop Chatbot Integration',
      category: 'AI/ML Development',
      startDate: '2023-10-01',
      endDate: '2023-10-10',
      timeSpent: '35 hours',
      progress: '60%',
      status: 'In Progress',
    },
    {
      id: 20,
      name: 'Publish Case Study',
      category: 'Content Marketing',
      startDate: '2023-10-15',
      endDate: '2023-10-25',
      timeSpent: '12 hours',
      progress: '90%',
      status: 'In Progress',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof (typeof tableData)[0] | '';
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });

  const addTableRow = () => {
    const newId = tableData.length + 1;
    const newItem = {
      id: newId,
      name: `Deliverable ${newId}`,
      category: 'Category X',
      startDate: '',
      endDate: '',
      timeSpent: '',
      progress: '',
      status: '',
    };
    setTableData((prevData) => [...prevData, newItem]);
  };

  const filteredData = tableData.filter((item) => {
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesCategory = categoryFilter
      ? item.category === categoryFilter
      : true;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key as keyof typeof a] || '';
    const bValue = b[sortConfig.key as keyof typeof b] || '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof (typeof tableData)[0]) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Deliverables</h1>

        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <button
            onClick={addTableRow}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Row
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex gap-4 mb-6">
          <DropdownFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={['Completed', 'In Progress', 'Pending']}
            label="All Status"
          />
          <DropdownFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={['Category A', 'Category B', 'Category X']}
            label="All Categories"
          />
        </div>

        {/* Table */}
        <DeliverablesTable
          data={sortedData}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </div>
    </div>
  );
};

export default Page;
