import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface NavigationProps {
  currentPage: number;
}

const NavNewUser: React.FC<NavigationProps> = ({ currentPage }) => {
  const pages = [
    { pageNumber: '01', label: 'Profile Setup', link: '/setup/profileSetup' },
    { pageNumber: '02', label: 'Set your Goals', link: '/setup/goalsSetup' },
    { pageNumber: '03', label: 'Select Genres', link: '/setup/genreSelect' },
  ];

  return (
    <nav className="flex justify-between items-center py-6 px-10 bg-orange-400 text-white">
      <h1 className="text-4xl text-brown-100 font-extrabold tracking-tighter">
        Shelfie
      </h1>
      <div className="flex items-center gap-4">
        {pages.map((page, index) => (
          <div key={page.pageNumber} className="flex gap-4 items-center">
            <Link href={page.link}>
              <p
                className={`${currentPage === index + 1 ? 'text-orange-100 font-extrabold' : 'font-normal'}`}
              >
                {page.pageNumber} {page.label}
              </p>
            </Link>

            <div className={`${index + 1 === pages.length ? 'hidden' : ''}`}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.14645 0.146447C3.95118 0.341709 3.95118 0.658291 4.14645 0.853553L11.2929 8L4.14645 15.1464C3.95118 15.3417 3.95118 15.6583 4.14645 15.8536C4.34171 16.0488 4.65829 16.0488 4.85355 15.8536L12.3536 8.35355C12.5488 8.15829 12.5488 7.84171 12.3536 7.64645L4.85355 0.146447C4.65829 -0.0488155 4.34171 -0.0488155 4.14645 0.146447Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <p className="text-4xl text-orange-400 font-extrabold tracking-tighter">
        Shelfie
      </p>
    </nav>
  );
};

export default NavNewUser;
