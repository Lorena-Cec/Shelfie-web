import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const NavBar = () => {

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
        <Link href="login">
            <p>Login</p>
        </Link>
       
    </nav>
  );
};

export default NavBar;