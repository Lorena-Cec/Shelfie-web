/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebaseConfig";
import { setUser } from "@/modules/authenticaton/state/authSlice";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { FaRegUserCircle, FaSearch } from "react-icons/fa";

const NavBar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchType, setSearchType] = useState<string>("title");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const [dropdownOpenProfile, setDropdownOpenProfile] = useState(false);

  const genres = [
    { name: "Fiction", subject: "fiction" },
    { name: "Non-Fiction", subject: "non-fiction" },
    { name: "Science Fiction", subject: "science fiction" },
    { name: "Fantasy", subject: "fantasy" },
    { name: "Mystery", subject: "mystery" },
    { name: "Romance", subject: "romance" },
    { name: "Biography", subject: "biography" },
  ];

  const options = [
    { name: "Profile", link: "/profile" },
    { name: "Reading Challenge", link: "/challenge" },
    { name: "Quotes", link: "/quotes" },
    { name: "Logout", link: "/" },
  ];

  const handleOptionSelect = (options: any) => {
    if (options.name == "Logout") {
      handleLogout();
    } else {
      router.push(`/${options.link}`);
      setDropdownOpenProfile(false);
    }
  };

  const handleGenreSelect = (subject: string) => {
    router.push(`/search?searchType=subject&searchTerm=${subject}`);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      dispatch(setUser(null));
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const handleSearch = () => {
    if (!searchTerm) return;
    router.push({
      pathname: "/search",
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
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex justify-between items-center px-10 bg-orange-300 text-white">
      <div className="flex items-center">
        <img src="/logowhite.png" alt="Logo" className="h-8  w-auto" />
      </div>
      <div className="flex justify-center items-center text-brown-200 rounded-md bg-orange-700 ml-72">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="p-2.5 bg-orange-700 rounded-md text-brown-100"
        >
          <option value="subject">Subject</option>
          <option value="author">Author</option>
          <option value="title">Title</option>
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 text-brown-100 bg-orange-700 placeholder-orange-200"
          placeholder={`Search by ${searchType}`}
        />
        <div className="h-10 w-10 flex items-center cursor-pointer">
          <FaSearch
            onClick={handleSearch}
            className="fill-brown-200 h-5 w-5 mx-auto"
          ></FaSearch>
        </div>
      </div>
      <ul className="flex items-center">
        <li className="hover:bg-orange-200 px-5 py-4">
          <Link href="/home" className="hover:text-white">
            Home
          </Link>
        </li>
        <li className="hover:bg-orange-200 px-5 py-4">
          <p>Feed</p>
        </li>
        <li className="hover:bg-orange-200 px-5 py-4">
          <Link href="/shelves/Read" className="hover:text-white">
            Shelves
          </Link>
        </li>
        <li className="relative hover:bg-orange-200">
          <p
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`cursor-pointer px-5 py-4 ${dropdownOpen ? "bg-orange-500" : ""}`}
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
        <li className="relative">
          <div
            className={` w-14 h-14 hover:bg-orange-200  flex items-center ${dropdownOpenProfile ? "bg-orange-500" : ""}`}
          >
            <FaRegUserCircle
              onClick={() => setDropdownOpenProfile(!dropdownOpenProfile)}
              className="cursor-pointer w-6 h-6 mx-auto"
            ></FaRegUserCircle>
          </div>
          {dropdownOpenProfile && (
            <ul className="absolute bg-white shadow-lg z-10 right-0">
              {options.map((option) => (
                <li
                  key={option.name}
                  onClick={() => handleOptionSelect(option)}
                >
                  <p className="text-brown-100 px-5 py-2 cursor-pointer hover:bg-orange-300 hover:text-white whitespace-nowrap">
                    {option.name}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
