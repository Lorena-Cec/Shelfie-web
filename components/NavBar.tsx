import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const NavBar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

  return (
    <nav className="flex justify-between items-center py-4 px-10 bg-primary-100 text-white">
        <div className="flex items-center">
        <img src="logo.png" alt="Logo" className="h-10  w-auto" />
        </div>
        <div>
            <p>Search</p>
        </div>
        <ul className='flex items-center gap-4'>
            <li className="hover:bg-primary-200">
                <Link href="/home" className="hover:text-white">My Books</Link>
            </li>
            <li className="hover:bg-primary-200">
                <p>Home</p>
            </li>
            <li className="hover:bg-primary-200">
                <p>Book lists</p>
            </li>
        </ul>
        <p>Login</p>
    </nav>
  );
};

export default NavBar;