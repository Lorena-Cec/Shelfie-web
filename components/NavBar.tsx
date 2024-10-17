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
    <nav className="flex justify-between items-center py-4 px-10 bg-orange-100 text-white">
        <div className="flex items-center">
        <img src="logo.png" alt="Logo" className="h-10  w-auto" />
        </div>
        <div>
            <input type="text" id="search-text" name="search-text" placeholder="Search books"></input>
        </div>
        <ul className='flex items-center gap-4'>
            <li className="hover:bg-orange-200">
                <Link href="/home" className="hover:text-white">Home</Link>
            </li>
            <li className="hover:bg-orange-200">
                <p>Feed</p>
            </li>
            <li className="hover:bg-orange-200">
                <p>Shelves</p>
            </li>
            <li className="hover:bg-orange-200">
                <p>Browse</p>
            </li>
            <li>
            <p onClick={handleLogout} className='cursor-pointer'>Logout</p>
            </li>
        </ul>
    </nav>
  );
};

export default NavBar;

function dispatch(arg0: any) {
    throw new Error('Function not implemented.');
}
