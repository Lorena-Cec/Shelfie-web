// /modules/shelves/components/ShelvesMenu.tsx
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useShelves from '../hooks/useShelves';
import ShelfDisplay from './ShelfDisplay';

const ShelvesMenu: React.FC = () => {
  const {
    selectedShelf,
    setSelectedShelf,
    books,
    handleDeleteBook,
    handleMoveBook,
    handleUpdateBook,
    hoveredRatings,
    setHoveredRatings
  } = useShelves();

  return (
    <div className='flex flex-col items-center w-full'>
      <div className="flex items-center mt-12 w-fit rounded-full bg-brown-500">
        <p
          className={`text-lg px-16 py-4 cursor-pointer rounded-full ${
            selectedShelf === 'Read' ? 'bg-orange-300 text-brown-700' : 'text-brown-100'
          }`}
          onClick={() => setSelectedShelf('Read')}
        >
          Read
        </p>
        <p
          className={`text-lg px-16 -ml-8 py-4 cursor-pointer rounded-full ${
            selectedShelf === 'Currently Reading' ? 'bg-orange-300 text-brown-700' : 'text-brown-100'
          }`}
          onClick={() => setSelectedShelf('Currently Reading')}
        >
          Currently Reading
        </p>
        <p
          className={`text-lg px-16 -ml-8 py-4 cursor-pointer rounded-full ${
            selectedShelf === 'To Read' ? 'bg-orange-300 text-brown-700' : 'text-brown-100'
          }`}
          onClick={() => setSelectedShelf('To Read')}
        >
          To Read
        </p>
      </div>
      <ShelfDisplay
        shelfName={selectedShelf}
        books={books}
        hoveredRatings={hoveredRatings}
        setHoveredRatings={setHoveredRatings}
        handleUpdateBook={handleUpdateBook}
        handleDeleteBook={handleDeleteBook}
        handleMoveBook={handleMoveBook}
      />
      <ToastContainer />
    </div>
  );
};

export default ShelvesMenu;
