'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './SearchBar';
import DropdownFilter from './DropdownFilter';
import Table from './Table';
import { debounce } from 'lodash';

interface GenericEntity {
  id: number;
  [key: string]: unknown;
}

interface Column<T> {
  key: keyof T;
  label: string;
  editable?: boolean;
}

interface GenericTablePageProps<T extends GenericEntity> {
  title: string;
  endpoint: string;
  userId?: string;
  columns: Column<T>[];
  allowAddRow?: boolean;
  showRouteButton?: boolean;
  routeBasePath?: string;
  showDeleteButton?: boolean;
}

const GenericTablePage = <T extends GenericEntity>({
  title,
  endpoint,
  columns,
  allowAddRow = true,
  showRouteButton,
  routeBasePath,
  userId,
  showDeleteButton = true,
}: GenericTablePageProps<T>) => {
  const [tableData, setTableData] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTableData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(
        `http://localhost:3333/${endpoint}${userId ? `/${userId}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 404) {
        setTableData([]);
        return;
      }

      if (!response.ok) throw new Error(await response.text());

      setTableData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleRequest = async (method: string, id?: number, body?: object) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const url =
        endpoint === 'deliverable_details'
          ? `http://localhost:3333/${endpoint}/${userId}/${id}/`
          : `http://localhost:3333/${endpoint}${id ? `/${id}` : ''}`;

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) throw new Error(await response.text());
      return response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const debouncedHandleRequest = useCallback(
    debounce(async (id: number, key: keyof T, value: string) => {
      await handleRequest('PUT', id, { [key]: value });
    }, 1500),
    []
  );

  const handleEdit = (id: string | number, key: keyof T, value: string) => {
    const formattedValue =
      key === 'target' ? (value.trim() === '' ? null : Number(value)) : value;
    setTableData((prev) =>
      prev.map((item) =>
        item.id === Number(id) ? { ...item, [key]: formattedValue } : item
      )
    );
    debouncedHandleRequest(Number(id), key, String(formattedValue));
  };

  const handleAddRow = async () => {
    if (
      await handleRequest(
        'POST',
        Number(userId),
        Object.fromEntries(columns.map(({ key }) => [key, '']))
      )
    ) {
      fetchTableData();
    }
  };

  const handleRemoveRow = async (id: string | number) => {
    const numericId = Number(id);
    await handleRequest('DELETE', numericId);
    setTableData((prev) => prev.filter((row) => row.id !== numericId));
  };

  if (loading)
    return <div className="text-center text-gray-700">Loading...</div>;
  if (error)
    return (
      <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
        Error: {error}
      </div>
    );

  const filteredData = tableData.filter(
    (item) =>
      (searchTerm
        ? columns.some(({ key }) =>
            String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
          )
        : true) &&
      (filterValue && filterValue !== 'All Categories'
        ? String(item.category || 'Unknown') === filterValue
        : true)
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">{title}</h1>
        <div className="flex items-center gap-4 mb-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <DropdownFilter
            value={filterValue}
            onChange={setFilterValue}
            options={[
              ...Array.from(
                new Set(
                  tableData.map((item) => String(item.category || 'Unknown'))
                )
              ),
            ]}
            label="All Categories"
          />
          {allowAddRow && (
            <button
              onClick={handleAddRow}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add New Row
            </button>
          )}
        </div>
        <Table
          data={filteredData}
          headers={columns}
          onEdit={handleEdit}
          onRemove={handleRemoveRow}
          showDeleteButton={showDeleteButton}
          showRouteButton={showRouteButton}
          routeBasePath={routeBasePath}
        />
      </div>
    </div>
  );
};

export default GenericTablePage;
