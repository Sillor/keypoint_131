'use client';

import React, { useState } from 'react';
import SearchBar from '../../../components/SearchBar';
import DropdownFilter from '../../../components/DropdownFilter';
import ProjectsTable from '../../../components/ProjectsTable';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();
  const [projects] = useState([
    {
      id: 1,
      name: 'Website Redesign',
      category: 'Web Development',
      status: 'In Progress',
    },
    {
      id: 2,
      name: 'Mobile App Development',
      category: 'App Development',
      status: 'Completed',
    },
    {
      id: 3,
      name: 'SEO Optimization',
      category: 'Marketing',
      status: 'Pending',
    },
    {
      id: 4,
      name: 'Product Launch Campaign',
      category: 'Marketing',
      status: 'In Progress',
    },
    {
      id: 5,
      name: 'AI Chatbot Integration',
      category: 'AI/ML',
      status: 'In Progress',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = statusFilter ? project.status === statusFilter : true;
    const matchesCategory = categoryFilter
      ? project.category === categoryFilter
      : true;
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const navigateToDeliverables = (projectId: number) => {
    router.push(`/dashboard/deliverables?projectId=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Projects</h1>

        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
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
            options={[
              'Web Development',
              'App Development',
              'Marketing',
              'AI/ML',
            ]}
            label="All Categories"
          />
        </div>

        {/* Table */}
        <ProjectsTable
          data={filteredProjects}
          onNavigate={navigateToDeliverables}
        />
      </div>
    </div>
  );
};

export default Page;
