import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const NavNewUser = () => {

  return (
    <nav className="flex justify-between items-center py-4 px-10 bg-orange-400 text-white">
        <h1>Shelfie</h1>
        <ul className='flex items-center gap-4'>
            <li className="hover:bg-primary-200">
                <Link href="/profileSetup" className="hover:text-white">Profile Setup</Link>
            </li>
            <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className='text-white' xmlns="http://www.w3.org/2000/svg">
                <path d="M4.14645 0.146447C3.95118 0.341709 3.95118 0.658291 4.14645 0.853553L11.2929 8L4.14645 15.1464C3.95118 15.3417 3.95118 15.6583 4.14645 15.8536C4.34171 16.0488 4.65829 16.0488 4.85355 15.8536L12.3536 8.35355C12.5488 8.15829 12.5488 7.84171 12.3536 7.64645L4.85355 0.146447C4.65829 -0.0488155 4.34171 -0.0488155 4.14645 0.146447Z" fill="currentColor"/>
                </svg>
            </li>
            <li className="hover:bg-primary-200">
                <Link href="/profileSetup" className="hover:text-white">Set your Goals</Link>
            </li>
            <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className='text-white' xmlns="http://www.w3.org/2000/svg">
                <path d="M4.14645 0.146447C3.95118 0.341709 3.95118 0.658291 4.14645 0.853553L11.2929 8L4.14645 15.1464C3.95118 15.3417 3.95118 15.6583 4.14645 15.8536C4.34171 16.0488 4.65829 16.0488 4.85355 15.8536L12.3536 8.35355C12.5488 8.15829 12.5488 7.84171 12.3536 7.64645L4.85355 0.146447C4.65829 -0.0488155 4.34171 -0.0488155 4.14645 0.146447Z" fill="currentColor"/>
                </svg>
            </li>
            <li className="hover:bg-primary-200">
                <Link href="/profileSetup" className="hover:text-white">Select Genres</Link>
            </li>
        </ul>
        <Link href="login">
            <p>Skip</p>
        </Link>
       
    </nav>
  );
};

export default NavNewUser;