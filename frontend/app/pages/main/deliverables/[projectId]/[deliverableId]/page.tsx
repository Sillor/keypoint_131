'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import GenericTablePage from '../../../../../components/GenericTable';
import { jwtDecode } from 'jwt-decode';

const DeliverableDetailsPage = () => {
  const params = useParams();
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);

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

  const deliverableId = Array.isArray(params?.deliverableId)
    ? params.deliverableId[0]
    : params?.deliverableId ?? '';

  return (
    <GenericTablePage
      title="Deliverable Details Table"
      endpoint="deliverable_details"
      userId={deliverableId}
      columns={[
        { key: 'id', label: 'ID', editable: false },
        { key: 'deliverable_id', label: 'Deliverable ID', editable: false },
        { key: 'task_name', label: 'Task Name', editable: isAdmin },
        { key: 'category', label: 'Category', editable: isAdmin },
        { key: 'start_date', label: 'Start Date', editable: isAdmin },
        { key: 'end_date', label: 'End Date', editable: isAdmin },
        { key: 'progress', label: 'Progress', editable: true },
        { key: 'status', label: 'Status', editable: isAdmin },
      ]}
      allowAddRow={isAdmin}
      showDeleteButton={isAdmin}
    />
  );
};

export default DeliverableDetailsPage;
