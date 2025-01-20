import React from 'react';

interface DropdownFilterProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    label: string;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({ value, onChange, options, label }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
        <option value="">{label}</option>
        {options.map((option) => (
            <option key={option} value={option}>
                {option}
            </option>
        ))}
    </select>
);

export default DropdownFilter;