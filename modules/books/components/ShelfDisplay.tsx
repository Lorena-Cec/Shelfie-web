/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Book } from "../models/Book";
import BookActions from "./BookActionsButtons";
import { Timestamp } from "firebase/firestore";

interface ShelfDisplayProps {
  shelfName: string;
  books: Book[];
  hoveredRatings?: { [key: string]: number | null };
  setBooks: (prev: any) => void;
  setHoveredRatings: (prev: any) => void;
  fetchBooks: () => Promise<void>;
  handleUpdateBook: (id: string, field: string, value: any) => void;
  handleDeleteBook: (id: string) => void;
  handleMoveBook: (id: string, newShelf: string) => void;
}

const ShelfDisplay: React.FC<ShelfDisplayProps> = ({
  shelfName,
  books = [],
  hoveredRatings = {},
  setHoveredRatings,
  handleUpdateBook,
  handleMoveBook,
}) => {
  const formatDate = (date: any) => {
    return date instanceof Timestamp
      ? date.toDate().toLocaleDateString()
      : "N/A";
  };

  return (
    <div className="text-center mt-8 w-full ">
      {books.length === 0 ? (
        <p className="text-sm mt-4">
          Add books to {shelfName} -{" "}
          <a href="/browse" className="text-blue-500">
            Browse here
          </a>
        </p>
      ) : (
        <div className="flex flex-col gap-2 mt-4">
          <div
            className={`grid ${shelfName === "To Read" ? "grid-cols-6" : shelfName === "Currently Reading" ? "grid-cols-8" : "grid-cols-7"} gap-4 px-16 py-4 font-bold bg-orange-300 text-brown-700`}
          >
            <div></div>
            <p>TITLE & AUTHOR</p>
            {shelfName !== "To Read" && <p>RATING</p>}
            {shelfName == "Currently Reading" && <p>PROGRESS</p>}
            <p>ADDED DATE</p>
            <p>START OF READING</p>
            <p>READ DATE</p>
            <div></div>
          </div>

          <div className="mb-2 flex flex-col gap-2">
            {books.map((book) => (
              <div
                key={book.id}
                className={`grid ${shelfName === "To Read" ? "grid-cols-6" : shelfName === "Currently Reading" ? "grid-cols-8" : "grid-cols-7"} gap-4 place-items-center px-16 py-8 bg-orange-600 text-brown-100`}
              >
                {/* COVER */}
                <a href={`/googleBooks/${book.id}`}>
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-36 h-52 shadow-3xl "
                  />
                </a>

                {/* Title and Authors */}
                <div>
                  <p className="text-xl font-bold">{book.title}</p>
                  <p>{book.authors?.join(", ")}</p>
                </div>

                {/* RATING */}
                {shelfName !== "To Read" && (
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
                          handleUpdateBook(book.id, "rating", index + 1)
                        }
                      />
                    ))}
                  </div>
                )}

                {/* PROGRESS */}
                {shelfName === "Currently Reading" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Read"
                      value={book.pagesRead || "0"}
                      className="p-1 border rounded w-20 text-center"
                      onChange={(e) => {
                        const newPagesRead = Number(e.target.value);
                        const pagesTotal = book.pagesTotal || 0;

                        if (newPagesRead > pagesTotal && pagesTotal > 0) {
                          alert(
                            "You can't read more than the total number of pages."
                          );
                          return;
                        }
                        handleUpdateBook(book.id, "pagesRead", newPagesRead);

                        if (newPagesRead == pagesTotal && pagesTotal != 0) {
                          handleMoveBook(book.id, "Read");
                          alert(
                            "Congratulations! You have completed the book, moving it to the Read shelf."
                          );
                        }
                      }}
                    />

                    {book.pagesTotal && book.pagesTotal > 0 ? (
                      <p className="text-lg">/{book.pagesTotal}</p>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <p className="text-lg">/</p>
                        <input
                          type="number"
                          placeholder="Total"
                          defaultValue={book.pagesTotal || ""}
                          className="p-1 border rounded w-20 text-center"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const inputValue = (e.target as HTMLInputElement)
                                .value;
                              if (inputValue) {
                                handleUpdateBook(
                                  book.id,
                                  "pagesTotal",
                                  Number(inputValue)
                                );
                              }
                            }
                          }}
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
                <p className="text-lg">{formatDate(book.startReading)}</p>

                {/* READ DATE */}
                <p className="text-lg">{formatDate(book.readDate)}</p>

                {/* EDIT, DELETE & MOVE ACTIONS */}
                <BookActions book={book}></BookActions>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelfDisplay;
