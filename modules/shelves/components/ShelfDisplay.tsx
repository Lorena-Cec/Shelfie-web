/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Book } from '../models/Book';

interface ShelfDisplayProps {
  shelfName: string;
  books: Book[];
  hoveredRatings?: { [key: string]: number | null };
  setHoveredRatings: (prev: any) => void;
  handleUpdateBook: (id: string, field: string, value: any) => void;
  handleDeleteBook: (id: string) => void;
  handleMoveBook: (id: string, newShelf: string) => void;
}

const ShelfDisplay: React.FC<ShelfDisplayProps> = ({
  shelfName,
  books,
  hoveredRatings = {},
  setHoveredRatings,
  handleUpdateBook,
  handleDeleteBook,
  handleMoveBook,
}) => {
  return (
    <div className="text-center mt-8 w-full ">
      {books.length === 0 ? (
        <p className="text-sm mt-4">
          Add books to {shelfName} -{' '}
          <a href="/browse" className="text-blue-500">
            Browse here
          </a>
        </p>
      ) : (
        <div className="flex flex-col gap-2 mt-4">
          <div
            className={`grid ${shelfName === 'To Read' ? 'grid-cols-6' : shelfName === 'Currently Reading' ? 'grid-cols-8' : 'grid-cols-7'} gap-4 px-16 py-4 font-bold bg-orange-300 text-brown-700`}
          >
            <div></div>
            <p>TITLE & AUTHOR</p>
            {shelfName !== 'To Read' && <p>RATING</p>}
            {shelfName == 'Currently Reading' && <p>PROGRESS</p>}
            <p>ADDED DATE</p>
            <p>START OF READING</p>
            <p>READ DATE</p>
            <div></div>
          </div>

          {books.map((book) => (
            <div
              key={book.id}
              className={`grid ${shelfName === 'To Read' ? 'grid-cols-6' : shelfName === 'Currently Reading' ? 'grid-cols-8' : 'grid-cols-7'} gap-4 place-items-center px-16 py-8 bg-orange-600 text-brown-100`}
            >
              <img
                src={book.image}
                alt={book.title}
                className="w-36 h-52 shadow-3xl "
              />
              <div>
                <p className="text-xl font-bold">{book.title}</p>
                <p>{book.authors?.join(', ')}</p>
              </div>

              {/* RATING */}
              {shelfName !== 'To Read' && (
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <img
                      key={index}
                      src={`/stars${index < (hoveredRatings?.[book.id] ?? book.rating ?? 0) ? index + 1 : 0}.png`}
                      alt={`${index + 1} star`}
                      className="w-8 h-8 cursor-pointer"
                      onMouseEnter={() =>
                        setHoveredRatings((prev: any) => ({
                          ...prev,
                          [book.id]: index + 1,
                        }))
                      }
                      onMouseLeave={() =>
                        setHoveredRatings((prev: any) => ({
                          ...prev,
                          [book.id]: null,
                        }))
                      }
                      onClick={() =>
                        handleUpdateBook(book.id, 'rating', index + 1)
                      }
                    />
                  ))}
                </div>
              )}

              {/* PROGRESS */}
              {shelfName === 'Currently Reading' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Read"
                    value={book.pagesRead || ''}
                    className="p-1 border rounded w-20 text-center"
                    onChange={(e) =>
                      handleUpdateBook(book.id, 'pagesRead', e.target.value)
                    }
                  />

                  {book.pagesTotal && book.pagesTotal > 0 ? (
                    <p className="text-lg">/{book.pagesTotal}</p>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <p className="text-lg">/</p>
                      <input
                        type="number"
                        placeholder="Total pages"
                        value={book.pagesTotal || ''}
                        className="p-1 border rounded w-24 text-center"
                        onChange={(e) =>
                          handleUpdateBook(
                            book.id,
                            'pagesTotal',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ADDED DATE */}
              <p className="text-lg">
                {new Date(book.addedDate).toLocaleDateString()}
              </p>

              {/* START OF READING */}
              <input
                type="date"
                value={
                  book.startReading
                    ? new Date(book.startReading).toISOString().substring(0, 10)
                    : ''
                }
                onChange={(e) =>
                  handleUpdateBook(book.id, 'startReading', e.target.value)
                }
                className="p-1 border rounded"
              />

              {/* READ DATE */}
              <input
                type="date"
                value={
                  book.readDate
                    ? new Date(book.readDate).toISOString().substring(0, 10)
                    : ''
                }
                onChange={(e) =>
                  handleUpdateBook(book.id, 'readDate', e.target.value)
                }
                className="p-1 border rounded"
              />
              {/* DELETE & MOVE ACTIONS */}
              <div className="flex flex-col items-center gap-2">
                {/* Delete Button */}
                <button
                  className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md mb-2 w-full"
                  onClick={() => handleDeleteBook(book.id)}
                >
                  Delete
                </button>

                {/* Move to Shelf Dropdown */}
                <select
                  className="px-4 py-2 rounded"
                  value=""
                  onChange={(e) => handleMoveBook(book.id, e.target.value)}
                >
                  <option value="" disabled>
                    Move to...
                  </option>
                  <option value="Read">Read</option>
                  <option value="Currently Reading">Currently Reading</option>
                  <option value="To Read">To Read</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShelfDisplay;
