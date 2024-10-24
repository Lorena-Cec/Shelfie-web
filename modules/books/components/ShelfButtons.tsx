import React from 'react';
import { useRouter } from 'next/router';
import useShelfFunctions from '@/modules/books/hooks/useShelfFunctions';

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

  return (
    <div className="flex flex-col ml-4">
      {shelves['Read'] && shelves['Read'].some((b) => b.id === book.id) ? (
        <div>
          <p className="text-brown-100">This book is on your Read Shelf.</p>
          <button
            onClick={() => router.push('/shelves/Read')}
            className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md"
          >
            View Read Shelf
          </button>
        </div>
      ) : shelves['Currently Reading'] &&
        shelves['Currently Reading'].some((b) => b.id === book.id) ? (
        <div>
          <p className="text-brown-100">
            You have this book on your Currently Reading Shelf.
          </p>
          <button
            onClick={() => router.push('/shelves/Currently%20Reading')}
            className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md"
          >
            View Currently Reading Shelf
          </button>
        </div>
      ) : shelves['To Read'] &&
        shelves['To Read'].some((b) => b.id === book.id) ? (
        <div>
          <p className="text-brown-100">
            You have this book on your To Read Shelf.
          </p>
          <button
            onClick={() => router.push('/shelves/To%20Read')}
            className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md"
          >
            View To Read Shelf
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => handleAddToShelf(book, 'Read')}
            className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md mb-2"
          >
            Read
          </button>
          <button
            onClick={() => handleAddToShelf(book, 'Currently Reading')}
            className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md mb-2"
          >
            Currently Reading
          </button>
          <button
            onClick={() => handleAddToShelf(book, 'To Read')}
            className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md"
          >
            To Read
          </button>
        </>
      )}
    </div>
  );
};

export default ShelfButtons;
