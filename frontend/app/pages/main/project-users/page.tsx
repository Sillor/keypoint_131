'use client';

import GenericTablePage from '../../../components/GenericTable';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';

const ProjectsPage = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [, setUserId] = useState<number | null>(null);

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
    <>
      {isAdmin && (
        <GenericTablePage
          title="Project-Users Table"
          endpoint="project-users"
          columns={[
            { key: 'id', label: 'ID', editable: true },
            { key: 'project_id', label: 'Project ID', editable: true },
            { key: 'user_id', label: 'User ID', editable: true },
            { key: 'role', label: 'Role', editable: true },
          ]}
        />
      )}
    </>
  );
};

export default ProjectsPage;
