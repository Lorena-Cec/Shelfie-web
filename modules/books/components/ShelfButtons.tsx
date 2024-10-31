import React, { useState } from "react";
import { useRouter } from "next/router";
import { FaChevronDown } from "react-icons/fa";
import useShelfFunctions from "@/modules/books/hooks/useShelfFunctions";

interface Book {
  id: string;
  title: string;
}

interface ShelfButtonsProps {
  book: Book;
}

const ShelfButtons: React.FC<ShelfButtonsProps> = ({ book }) => {
  const router = useRouter();
  const { shelves, handleAddToShelf } = useShelfFunctions();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const existingShelf = Object.keys(shelves).find(
    (shelfName) =>
      shelves[shelfName] && shelves[shelfName].some((b) => b.id === book.id)
  );

  return (
    <div className="flex flex-col ml-4">
      {existingShelf ? (
        <div>
          <p className="text-brown-100">
            You already have this book on your shelf.
          </p>
          <button
            onClick={() =>
              router.push(`/shelves/${encodeURIComponent(existingShelf)}`)
            }
            className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md"
          >
            View Shelf
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md flex items-center"
          >
            Add to Shelf
            <FaChevronDown className="ml-2" />
          </button>
          {dropdownOpen && (
            <div className="absolute mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-fit">
              {Object.keys(shelves).map((shelfName) => (
                <button
                  key={shelfName}
                  onClick={() => {
                    handleAddToShelf(book, shelfName);
                    setDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-brown-100 hover:bg-orange-500 rounded-md whitespace-nowrap"
                >
                  {shelfName}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShelfButtons;
