'use client';

import { useParams } from 'next/navigation';
import GenericTablePage from '../../../components/GenericTable';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';

const ProjectsPage = () => {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        interface DecodedToken {
          role: string;
          id: number;
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        setUserId(decodedToken.id);
      } catch (error) {
        console.error('Invalid token', error);
      }
    }
  }, []);

  return (
    <GenericTablePage
      title="Projects Table"
      endpoint="projects"
      userId={userId ? String(userId) : undefined} // Only pass if it exists
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
    />
  );
};

export default ProjectsPage;
