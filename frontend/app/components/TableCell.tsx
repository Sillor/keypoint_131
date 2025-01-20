import React from 'react';

// Reusable TableCell Component
const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <td className="px-6 py-4 text-sm">{children}</td>
);

export default TableCell;