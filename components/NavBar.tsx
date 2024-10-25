import React, { useEffect, useRef, useState } from 'react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  const genres = [
    { name: 'Fiction', subject: 'fiction' },
    { name: 'Non-Fiction', subject: 'non-fiction' },
    { name: 'Science Fiction', subject: 'science fiction' },
    { name: 'Fantasy', subject: 'fantasy' },
    { name: 'Mystery', subject: 'mystery' },
    { name: 'Romance', subject: 'romance' },
    { name: 'Biography', subject: 'biography' },
  ];

  const handleGenreSelect = (subject: string) => {
    router.push(`/search?searchType=subject&searchTerm=${subject}`);
    setDropdownOpen(false);
  };

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

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex justify-between items-center py-4 px-10 bg-orange-300 text-white">
      <div className="flex items-center">
        <img src="logowhite.png" alt="Logo" className="h-10  w-auto" />
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
      <ul className="flex items-center">
        <li className="hover:bg-orange-200 px-5 py-3">
          <Link href="/home" className="hover:text-white">
            Home
          </Link>
        </li>
        <li className="hover:bg-orange-200 px-5 py-3">
          <p>Feed</p>
        </li>
        <li className="hover:bg-orange-200 px-5 py-3">
          <Link href="/shelves/Read" className="hover:text-white">
            Shelves
          </Link>
        </li>
        <li className="relative hover:bg-orange-200">
          <p
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`cursor-pointer px-5 py-3 ${dropdownOpen ? 'bg-orange-300' : ''}`}
          >
            Browse
          </p>
          {dropdownOpen && (
            <ul className="absolute bg-white shadow-lg z-10 -left-14">
              {genres.map((genre) => (
                <li
                  key={genre.subject}
                  onClick={() => handleGenreSelect(genre.subject)}
                >
                  <p className="text-brown-100 px-5 py-2 cursor-pointer hover:bg-orange-300 hover:text-white whitespace-nowrap">
                    {genre.name}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li>
          <p onClick={handleLogout} className="cursor-pointer px-5 py-3">
            Logout
          </p>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
