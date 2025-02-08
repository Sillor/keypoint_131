'use client';

import { useParams } from 'next/navigation';
import GenericTablePage from '../../../../components/GenericTable';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';

const DeliverablesPage = () => {
  const params = useParams();
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);

  const projectId = Array.isArray(params?.projectId)
    ? params.projectId[0]
    : params?.projectId ?? '';

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
      title="Deliverables Table"
      endpoint="deliverables"
      userId={projectId}
      columns={[
        { key: 'id', label: 'Deliverable ID', editable: false },
        { key: 'project_id', label: 'Project ID', editable: false },
        { key: 'name', label: 'Name', editable: isAdmin },
        { key: 'category', label: 'Category', editable: isAdmin },
        { key: 'start_date', label: 'Start Date', editable: isAdmin },
        { key: 'end_date', label: 'End Date', editable: isAdmin },
        { key: 'progress', label: 'Progress', editable: true },
        { key: 'status', label: 'Status', editable: isAdmin },
      ]}
      showRouteButton={true}
      routeBasePath={`./pages/main/deliverables/${projectId}/`}
      allowAddRow={isAdmin}
      showDeleteButton={isAdmin}
    />
  );
};

export default DeliverablesPage;
