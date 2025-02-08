'use client';

import { useParams } from 'next/navigation';
import GenericTablePage from '../../../../components/GenericTable';

const DeliverablesPage = () => {
  const params = useParams();
  const projectId = Array.isArray(params?.projectId)
    ? params.projectId[0]
    : params?.projectId ?? '';

  return (
    <GenericTablePage
      title="Deliverables Table"
      endpoint="deliverables"
      userId={projectId}
      columns={[
        { key: 'id', label: 'ID', editable: false },
        { key: 'project_id', label: 'Project ID', editable: false },
        { key: 'name', label: 'Name', editable: false },
        { key: 'category', label: 'Category', editable: false },
        { key: 'start_date', label: 'Start Date', editable: false },
        { key: 'end_date', label: 'End Date', editable: false },
        { key: 'progress', label: 'Progress', editable: true },
        { key: 'status', label: 'Status', editable: false },
      ]}
      showRouteButton={true}
      routeBasePath={`./pages/main/deliverables/${projectId}/`}
    />
  );
};

export default DeliverablesPage;
