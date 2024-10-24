import React, { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebaseConfig';
import { setUser } from '@/modules/authenticaton/state/authSlice';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

const NavBar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('subject');

  const handleLogout = async () => {
    try {
      await auth.signOut();
      dispatch(setUser(null));
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  const handleSearch = () => {
    if (!searchTerm) return;
    router.push({
      pathname: '/search',
      query: { searchType, searchTerm },
    });
  };

  return (
    <nav className="flex justify-between items-center py-4 px-10 bg-orange-200 text-white">
      <div className="flex items-center">
        <img src="logo.png" alt="Logo" className="h-10  w-auto" />
      </div>
      <div className="flex justify-center items-center gap-4">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="p-2 bg-white rounded-md text-brown-100"
        >
          <option value="subject">Subject</option>
          <option value="author">Author</option>
          <option value="title">Title</option>
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-md text-brown-100"
          placeholder={`Search by ${searchType}`}
        />

        <button
          onClick={handleSearch}
          className="bg-orange-100 text-white p-2 rounded-md"
        >
          Search
        </button>
      </div>
      <ul className="flex items-center gap-4">
        <li className="hover:bg-orange-200">
          <Link href="/home" className="hover:text-white">
            Home
          </Link>
        </li>
        <li className="hover:bg-orange-200">
          <p>Feed</p>
        </li>
        <li className="hover:bg-orange-200">
          <Link href="/shelves/Read" className="hover:text-white">
            Shelves
          </Link>
        </li>
        <li className="hover:bg-orange-200">
          <p>Browse</p>
        </li>
        <li>
          <p onClick={handleLogout} className="cursor-pointer">
            Logout
          </p>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
