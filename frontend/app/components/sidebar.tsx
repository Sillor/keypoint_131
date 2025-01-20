import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-full bg-[#234E52] text-white flex flex-col items-start py-6 px-4 shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center mb-10">
        {/* Placeholder for Logo */}
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
        <span className="text-2xl font-bold text-    ml-3">KeyPoint</span>
      </div>

      {/* Navigation Links */}
      <ul className="w-full">
        <li className="mb-4">
          <Link href="/" passHref>
            <div className="flex items-center text-gray-300 hover:text-white cursor-pointer transition-colors duration-300">
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
                  d="M3 12l2-2m0 0l7-7 7 7m-9 12v-8m0 0H4m6 0h6"
                />
              </svg>
              Dashboard
            </div>
          </Link>
        </li>
        <li className="mb-4">
          <Link href="/deliverables" passHref>
            <div className="flex items-center text-white cursor-pointer font-semibold transition-colors duration-300">
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
              Deliverables
            </div>
          </Link>
        </li>
        <li className="mb-4">
          <Link href="/kpi-overview" passHref>
            <div className="flex items-center text-gray-300 hover:text-white cursor-pointer transition-colors duration-300">
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
              KPI Overview
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
