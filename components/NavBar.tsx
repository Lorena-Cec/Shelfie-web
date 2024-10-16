import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebaseConfig';
import { setUser } from '@/modules/authenticaton/state/authSlice';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

const NavBar = () => {
    const dispatch = useDispatch(); 
    const router = useRouter(); 

    const handleLogout = async () => {
        try {
          await auth.signOut();
          dispatch(setUser(null)); 
          router.push('/login'); 
        } catch (error) {
          console.error('Error logging out: ', error);
        }
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
        <p onClick={handleLogout} className='cursor-pointer'>Logout</p>
       
    </nav>
  );
};

export default NavBar;

function dispatch(arg0: any) {
    throw new Error('Function not implemented.');
}
