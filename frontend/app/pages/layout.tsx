import React from 'react';
import Sidebar from '../components/sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
};

export default Layout;
