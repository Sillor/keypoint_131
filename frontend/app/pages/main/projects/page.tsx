'use client';

import { useParams } from 'next/navigation';
import GenericTablePage from '../../../components/GenericTable';

const ProjectsPage = () => {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';
  return (
    <GenericTablePage
      title="Projects Table"
      endpoint="projects"
      userId={id}
      columns={[
        { key: 'id', label: 'ID', editable: false },
        { key: 'name', label: 'Name', editable: true },
        { key: 'category', label: 'Category', editable: true },
        { key: 'start_date', label: 'Start Date', editable: true },
        { key: 'end_date', label: 'End Date', editable: true },
        { key: 'status', label: 'Status', editable: true },
      ]}
      showRouteButton={true}
      routeBasePath="./pages/main/projects"
    />
  );
};

export default ProjectsPage;
