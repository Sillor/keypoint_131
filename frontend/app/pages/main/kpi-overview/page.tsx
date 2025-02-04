'use client';

import React, { useState } from 'react';
import SearchBar from '../../../components/SearchBar';
import DropdownFilter from '../../../components/DropdownFilter';
import KPITable from '../../../components/KPITable';

// Main Page Component
interface KPI {
  id: number;
  category: string;
  kpiId: number;
  kpi: string;
  description: string;
  target: number | string;
  uom: string;
  frequency: string;
  status: string;
}

const Page = () => {
  const [tableData, setTableData] = useState<KPI[]>([
    {
      id: 1,
      category: 'Projects or Deliverables',
      kpiId: 1,
      kpi: 'On-time delivery',
      description: 'Projects delivered on time and within budget',
      target: 3,
      uom: 'Number of projects submitted On time /Total Number of Reports',
      frequency: 'Monthly',
      status: '',
    },
    {
      id: 2,
      category: 'Projects or Deliverables',
      kpiId: 2,
      kpi: 'Project quality',
      description:
        'Projects delivered with high quality - according to standard and expectations',
      target: 2,
      uom: 'Number of projects that meet standards and guidelines',
      frequency: 'Annually',
      status: '',
    },
    {
      id: 3,
      category: 'Professional Development',
      kpiId: 3,
      kpi: 'Acquire New Skills (tools, software, etc.)',
      description: 'Software / Programming to learn',
      target: 2,
      uom: 'Planned Vs Completed - Number of workshops attended / Total Expected',
      frequency: 'Semi-annually',
      status: '',
    },
    {
      id: 4,
      category: 'Professional Development',
      kpiId: 4,
      kpi: 'Presentation Skills',
      description: 'Number of presentations prepared & delivered',
      target: 2,
      uom: 'Number of presentations prepared / Total Expected',
      frequency: 'Annually',
      status: '',
    },
    {
      id: 5,
      category: 'Professional Development',
      kpiId: 5,
      kpi: 'Workshops / Seminars Attended',
      description: 'Relevant Seminars / Workshops Participated In',
      target: 2,
      uom: 'Number of workshops attended / Total Expected',
      frequency: 'Annually',
      status: '',
    },
    {
      id: 6,
      category: 'Productivity (Specific Tasks)',
      kpiId: 7,
      kpi: 'Number of Projects /tasks',
      description: 'Number of tasks / projects completed over a period of time',
      target: '',
      uom: 'No of projects completed successfully',
      frequency: 'Monthly / Quarterly',
      status: '',
    },
    {
      id: 7,
      category: 'Productivity (Specific Tasks)',
      kpiId: 8,
      kpi: 'Number of ideas / proposals',
      description:
        'New ideas / processes and initiatives along with implementation success',
      target: '',
      uom: 'Number of ideas proposed vs ideas used / implemented',
      frequency: 'Quarterly',
      status: '',
    },
    {
      id: 8,
      category: 'Productivity (Specific Tasks)',
      kpiId: 9,
      kpi: 'Number of Deliverables',
      description: 'Number of deliverables completed',
      target: '',
      uom: 'Number of deliverables completed',
      frequency: 'Monthly',
      status: '',
    },
    {
      id: 9,
      category: 'Attendance',
      kpiId: 10,
      kpi: 'Daily attendance',
      description:
        'Number of absences (without a legitimate reason) - not including sick leave',
      target: '',
      uom: 'Number of Standup meetings attended / Total Meetings Expected',
      frequency: 'Annually',
      status: '',
    },
    {
      id: 10,
      category: 'Leadership & Teamwork',
      kpiId: 11,
      kpi: 'Ownership of at least one major project',
      description:
        'Successful completion - Report checked and approved by manager / lead',
      target: '',
      uom: 'Number of successful projects completed - Report submitted for approval',
      frequency: 'Annually',
      status: '',
    },
    {
      id: 11,
      category: 'Knowledge Transfer',
      kpiId: 12,
      kpi: 'Number of personnel being supported and empowered',
      description: 'Knowledge transfer to specific personnel in the SPO',
      target: '',
      uom: 'Number of Local Personnel Trained / Target number of local to be trained',
      frequency: 'Annually',
      status: '',
    },
    {
      id: 12,
      category: 'Punctuality',
      kpiId: 13,
      kpi: 'On time for work, meetings, etc.',
      description: 'Number of late days',
      target: '',
      uom: 'Daily tracking of clock-in time - compared to scheduled start time',
      frequency: 'Annually',
      status: '',
    },
    {
      id: 13,
      category: 'Working Hours',
      kpiId: 14,
      kpi: 'Compliance & Adherence - SPO Working hours - 8:00 am - 5:00 pm',
      description: 'Number of days not compliant',
      target: 0,
      uom: 'Total work hours vs Expected',
      frequency: 'Annually',
      status: '',
    },
    {
      id: 14,
      category: 'Self-Reflection and Self-Assessment',
      kpiId: 15,
      kpi: 'Personal self-assessment goal (for self-improvement and career development)',
      description: 'Goal type, duration and completion',
      target: '',
      uom: 'Annual review',
      frequency: 'Semi-annually',
      status: '',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const addTableRow = () => {
    const newId = tableData.length + 1;
    const newItem = {
      id: newId,
      category: 'New Category',
      kpiId: newId,
      kpi: `KPI ${newId}`,
      description: '',
      target: '',
      uom: '',
      frequency: '',
      status: '',
    };
    setTableData((prevData) => [...prevData, newItem]);
  };

  const filteredData = tableData.filter((item) => {
    const matchesCategory = categoryFilter
      ? item.category === categoryFilter
      : true;
    const matchesSearch = item.kpi
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedData = filteredData;
  const handleEdit = (id: string | number, key: keyof KPI, value: string) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">KPI Table</h1>

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

        {/* Dropdown Filter */}
        <div className="flex gap-4 mb-6">
          <DropdownFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              'Projects or Deliverables',
              'Professional Development',
              'Productivity (Specific Tasks)',
              'Attendance',
              'Leadership & Teamwork',
            ]}
            label="All Categories"
          />
        </div>

        {/* KPI Table */}
        <KPITable data={sortedData} handleEdit={handleEdit} />
      </div>
    </div>
  );
};

export default Page;
