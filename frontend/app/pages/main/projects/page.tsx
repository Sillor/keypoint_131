'use client';

import { useParams } from 'next/navigation';
import GenericTablePage from '../../../components/GenericTable';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';

const ProjectsPage = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        interface DecodedToken {
          role: string;
          id: number;
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        setIsAdmin(decodedToken.role === 'admin');
        setUserId(decodedToken.id);
      } catch (error) {
        console.error('Invalid token', error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  return (
    <GenericTablePage
      title="Projects Table"
      endpoint="projects"
      columns={[
        { key: 'id', label: 'ID', editable: false },
        { key: 'name', label: 'Name', editable: true },
        { key: 'category', label: 'Category', editable: true },
        { key: 'start_date', label: 'Start Date', editable: true },
        { key: 'end_date', label: 'End Date', editable: true },
        { key: 'status', label: 'Status', editable: true },
      ]}
      showRouteButton={true}
      routeBasePath="./pages/main/deliverables/"
      showDeleteButton={isAdmin ?? false}
    />
  );
};

export default ProjectsPage;
