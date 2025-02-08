'use client';

import { useParams } from 'next/navigation';
import GenericTablePage from '../../../../components/GenericTable';

const KPIPage = () => {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';
  return (
    <GenericTablePage
      title="KPI Table"
      endpoint="kpi"
      userId={id}
      columns={[
        { key: 'id', label: 'ID', editable: false },
        { key: 'category', label: 'Category', editable: true },
        { key: 'kpi', label: 'KPI', editable: true },
        { key: 'description', label: 'Description', editable: true },
        { key: 'target', label: 'Target', editable: true },
        { key: 'uom', label: 'UoM', editable: true },
        { key: 'frequency', label: 'Frequency', editable: true },
        { key: 'status', label: 'Status', editable: true },
      ]}
    />
  );
};

export default KPIPage;
