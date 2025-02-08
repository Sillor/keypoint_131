'use client';

import { useParams } from 'next/navigation';
import GenericTablePage from '../../../../../components/GenericTable';

const DeliverableDetailsPage = () => {
  const params = useParams();

  const projectId = Array.isArray(params?.projectId)
    ? params.projectId[0]
    : params?.projectId ?? '';

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
        { key: 'task_name', label: 'Task Name', editable: false },
        { key: 'category', label: 'Category', editable: false },
        { key: 'start_date', label: 'Start Date', editable: false },
        { key: 'end_date', label: 'End Date', editable: false },
        { key: 'progress', label: 'Progress', editable: true },
        { key: 'status', label: 'Status', editable: false },
      ]}
    />
  );
};

export default DeliverableDetailsPage;
