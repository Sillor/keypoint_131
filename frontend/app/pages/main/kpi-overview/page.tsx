'use client';

import React, { useState, useEffect } from 'react';
import SearchBar from '../../../components/SearchBar';
import DropdownFilter from '../../../components/DropdownFilter';
import KPITable from '../../../components/KPITable';

// Main Page Component
interface KPI {
  id: number;
  kpiId: number;
  user_id?: number;
  category: string;
  kpi: string;
  description: string;
  target: number | string;
  uom: string;
  frequency: string;
  status: string;
}

const Page = () => {
  const [tableData, setTableData] = useState<KPI[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch('http://localhost:3333/kpi', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setTableData([]);
            return;
          }
          const errorMessage = await response.text();
          throw new Error(errorMessage || 'Failed to fetch KPI data');
        }

        const data: KPI[] = await response.json();

        // Debug: Log the fetched data
        console.log('Fetched KPIs:', data);

        setTableData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  const filteredData = tableData.filter((item) => {
    const matchesCategory = categoryFilter
      ? item.category === categoryFilter
      : true;
    const matchesSearch =
      item.kpi && typeof item.kpi === 'string'
        ? item.kpi.toLowerCase().includes(searchTerm.toLowerCase())
        : true; // Allow empty kpi fields
    return matchesCategory && matchesSearch;
  });

  const handleEdit = (id: number, key: keyof KPI, value: string) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      )
    );
  };

  if (loading)
    return <div className="text-center text-gray-700">Loading...</div>;
  if (error)
    return (
      <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
        Error: {error}
      </div>
    );

  const handleAddKPI = (newKPI: KPI) => {
    setTableData((prevData) => [...prevData, newKPI]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">KPI Table</h1>

        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        {/* Dropdown Filter */}
        <div className="flex gap-4 mb-6">
          <DropdownFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              ...new Set(
                tableData.map((item) => String(item.category || 'Unknown'))
              ),
            ]}
            label="All Categories"
          />
        </div>

        {/* Table */}
        <KPITable
          data={filteredData}
          handleEdit={handleEdit}
          handleAddKPI={handleAddKPI}
        />
      </div>
    </div>
  );
};

export default Page;
