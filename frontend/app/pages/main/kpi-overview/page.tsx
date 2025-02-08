import GenericTablePage from '../../../components/GenericTable';

const KPIPage = () => (
  <GenericTablePage
    title="KPI Table"
    endpoint="kpi"
    columns={[
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

export default KPIPage;
