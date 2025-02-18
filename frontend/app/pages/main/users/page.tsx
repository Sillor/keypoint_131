import GenericTablePage from '../../../components/GenericTable';

const UsersPage = () => {
  return (
    <GenericTablePage
      title="Users Table"
      endpoint="users"
      columns={[
        { key: 'id', label: 'ID', editable: false },
        { key: 'name', label: 'Name', editable: true },
        { key: 'email', label: 'Email', editable: true },
        { key: 'role', label: 'Role', editable: false },
        { key: 'created_at', label: 'Created At', editable: false },
      ]}
      showRouteButton={true}
      routeBasePath="./pages/main/kpi"
      allowAddRow={false}
      showDeleteButton={false}
    />
  );
};

export default UsersPage;
