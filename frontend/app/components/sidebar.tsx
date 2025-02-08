'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        interface DecodedToken {
          role: string;
          id: number;
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        setIsAdmin(decodedToken.role === 'admin');
        setUserId(decodedToken.id);
      } catch (error) {
        console.error('Invalid token', error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  if (isAdmin === null) {
    return null; // Prevent rendering until role is determined
  }

  const menuItems = [
    {
      name: 'Projects',
      path: '/pages/main/projects',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 mr-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      ),
    },
    {
      name: isAdmin ? 'Users' : 'KPI Overview',
      path: isAdmin ? '/pages/main/users' : `/pages/main/kpi/${userId}`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 mr-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4m0-8v8m0-8c2.2 0 4-1.8 4-4m-4 0a4 4 0 110 8m0-4v8m0-8c-2.2 0-4 1.8-4 4m0-4c0 2.2 1.8 4 4 4m0-4v8"
          />
        </svg>
      ),
    },
  ];

  if (isAdmin) {
    menuItems.push({
      name: 'Project Users',
      path: '/pages/main/project-users',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 mr-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    });
  }

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="w-64 h-full bg-[#234E52] text-white flex flex-col items-start py-6 px-4 shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center mb-10">
        <div className="w-10 h-10 bg-transparent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-10 h-10 text-teal-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3c3.9 0 7.5 1.5 10.2 4.2m-1.4 2.8c.2.8.2 1.7 0 2.4m-2.3 3.6c-1.5 1.5-3.5 2.4-5.5 2.4m-7.1-4.5a7.5 7.5 0 010-10.6M2.8 12c.2.8.6 1.5 1.1 2.2M10.6 19.1c-.5.5-1.1.9-1.7 1.2"
            />
          </svg>
        </div>
        <span className="text-2xl font-bold ml-3">KeyPoint</span>
      </div>

      {/* Navigation Links */}
      <ul className="w-full flex-grow">
        {menuItems.map((item) => (
          <li key={item.path} className="mb-4">
            <Link href={item.path}>
              <div
                className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-300 ${
                  pathname === item.path
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.icon}
                {item.name}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
