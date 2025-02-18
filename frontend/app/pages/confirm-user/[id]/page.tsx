'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

const ConfirmUser: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id: userId } = useParams();

  useEffect(() => {
    if (!userId) {
      setStatusMessage('Invalid confirmation link.');
      setLoading(false);
      return;
    }

    const confirmUser = async () => {
      try {
        // Retrieve token from localStorage
        const token = localStorage.getItem('token');

        const response = await fetch(
          `http://localhost:3333/confirm-user/${userId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStatusMessage('User confirmed successfully! User can now log in.');
        } else {
          setStatusMessage(data.message || 'Failed to confirm user.');
        }
      } catch (error) {
        console.error('Error confirming user:', error);
        setStatusMessage('An error occurred. Please try again.');
      }
      setLoading(false);
    };

    confirmUser();
  }, [userId]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 h-full bg-[#234E52] text-white flex flex-col items-start py-6 px-4 shadow-lg">
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
      </div>

      {/* Confirmation Box */}
      <div className="flex flex-1 justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
            Confirming Your Account
          </h2>
          {loading ? (
            <p className="text-center text-gray-600">
              Processing confirmation...
            </p>
          ) : (
            <>
              <p
                className={`text-center text-sm ${
                  statusMessage?.includes('success')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {statusMessage}
              </p>
              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/pages/auth/login/')}
                  className="bg-teal-500 text-white py-2 px-6 rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmUser;
