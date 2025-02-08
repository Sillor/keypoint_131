import GenericTablePage from '../../../components/GenericTable';

const UsersPage = () => {
  return (
    <GenericTablePage
      title="Users Table"
      endpoint="users"
      columns={[
        { key: 'id', label: 'id', editable: false },
        { key: 'name', label: 'Name', editable: true },
        { key: 'email', label: 'Email', editable: true },
        { key: 'role', label: 'Role', editable: false },
        { key: 'created_at', label: 'Created At', editable: true },
      ]}
      showRouteButton={true}
      routeBasePath="kpi"
    />
  );
};

export default UsersPage;
