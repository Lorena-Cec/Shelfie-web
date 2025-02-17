import { useEffect, useState } from "react";
import React from "react";
import useShelves from "../hooks/useShelves";
import { Book } from "../models/Book";
import { Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

interface BookActionsProps {
  book: Book;
}

const BookActions: React.FC<BookActionsProps> = ({ book }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotes, setQuotes] = useState([""]);
  const {
    hoveredRatings,
    handleSetBooks,
    setHoveredRatings,
    handleUpdatesBook,
    handleDeleteBook,
    handleMoveBook,
    selectedShelf,
    fetchAndSetShelves,
    customShelves,
    fetchBooksOnShelf,
  } = useShelves();
  const [reviewText, setReviewText] = useState(book.review || "");
  const [rating, setRating] = useState(0);
  const [startReadingDate, setStartReadingDate] = useState<Date | null>(null);
  const [readDate, setReadDate] = useState<Date | null>(null);
  const [rereadDates, setRereadDates] = useState<string[]>(
    book.rereadDates || []
  );
  const [newRereadDate, setNewRereadDate] = useState<string>("");
  const [newPagesRead, setNewPagesRead] = useState(0);
  const [newPagesTotal, setNewPagesTotal] = useState(0);
  const [, setUserId] = useState<string | null>(null);
  const [shelvesWithBook, setShelvesWithBook] = useState<string[]>([]);
  const allShelves = ["Read", "Currently Reading", "To Read"];
  const combinedShelves = [...customShelves, ...allShelves];

  useEffect(() => {
    const fetchShelvesForBook = async () => {
      const shelves: string[] = [];

      for (const shelf of combinedShelves) {
        const booksOnShelf = await fetchBooksOnShelf(shelf);
        if (
          book &&
          Array.isArray(booksOnShelf) &&
          booksOnShelf.some((b) => b.id === book.id)
        ) {
          shelves.push(shelf);
        }
      }

      setShelvesWithBook(shelves);
    };

    fetchShelvesForBook();
  }, [book.id, allShelves]);

  useEffect(() => {
    if (book) {
      setReviewText(book.review || "");
      setRereadDates(book.rereadDates || []);
      setQuotes(book.quotes || []);
      setRating(book.rating || 0);
      setNewPagesRead(book.pagesRead || 0);
      setNewPagesTotal(book.pagesTotal || 0);

      if (
        book.startReading &&
        typeof book.startReading === "object" &&
        "seconds" in book.startReading
      ) {
        setStartReadingDate((book.startReading as Timestamp).toDate());
      } else if (typeof book.startReading === "string") {
        setStartReadingDate(new Date(book.startReading));
      } else {
        setStartReadingDate(null);
      }

      if (
        book.readDate &&
        typeof book.readDate === "object" &&
        "seconds" in book.readDate
      ) {
        setReadDate((book.readDate as Timestamp).toDate());
      } else if (typeof book.readDate === "string") {
        setReadDate(new Date(book.readDate));
      } else {
        setReadDate(null);
      }
    }
  }, [book]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchAndSetShelves(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleQuoteChange = (index: number, value: string) => {
    const updatedQuotes = [...quotes];
    updatedQuotes[index] = value;
    setQuotes(updatedQuotes);
  };

  const addQuoteField = () => setQuotes([...quotes, ""]);

  const removeQuoteField = (index: number) => {
    const updatedQuotes = quotes.filter((_, i) => i !== index);
    setQuotes(updatedQuotes);
  };

  const handleSave = () => {
    let recentRating = null;

    if (rating != book.rating) {
      recentRating = new Date().toISOString();
    }

    const updates = {
      rating: rating,
      review: reviewText,
      quotes: quotes,
      startReading: startReadingDate,
      readDate: readDate,
      rereadDates: rereadDates,
      pagesRead: newPagesRead,
      pagesTotal: newPagesTotal,
      recentRating: recentRating,
    };

    if (newPagesRead > newPagesTotal && newPagesTotal > 0) {
      alert("You can't read more than the total number of pages.");
      return;
    }

    if (newPagesRead >= newPagesTotal && newPagesTotal !== 0) {
      alert(
        "Congratulations! You have completed the book, set the read date to move it to your Read shelf."
      );
    }
    handleSetBooks(book.id, updates);
    handleUpdatesBook(book.id, updates);
    toast.success(
      `You've successfully edited ${book.title}! Refresh to see the changes.`
    );
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setIsModalOpen(false);

    setReviewText("");
    setRereadDates([]);
    setQuotes([]);
    setNewRereadDate("");
    setHoveredRatings({});
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Edit Button */}
      <button
        className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md mb-2 w-full"
        onClick={() => setIsModalOpen(true)}
      >
        Edit
      </button>

      {/* Delete Button */}
      <button
        className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md mb-2 w-full"
        onClick={() => handleDeleteBook(book.id)}
      >
        Delete
      </button>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full h-0.9 overflow-y-scroll">
            {/* Book Details */}
            <div className="flex mb-4">
              <img
                src={book.image}
                alt={book.title}
                className="w-20 h-28 mr-4"
              />
              <div>
                <h3 className="font-bold">{book.title}</h3>
                <p>{book.authors}</p>
              </div>
            </div>

            {/* My Rating */}
            <div className="flex items-center mb-4">
              <p className="font-semibold text-left">My Rating:&ensp;</p>
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <img
                    key={index}
                    src={`/stars${index < (hoveredRatings?.[book.id] ?? rating ?? 0) ? index + 1 : 0}.png`}
                    alt={`${index + 1} star`}
                    className="w-8 h-8 cursor-pointer"
                    onMouseEnter={() =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      setHoveredRatings((prev: any) => ({
                        ...prev,
                        [book.id]: index + 1,
                      }))
                    }
                    onMouseLeave={() =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      setHoveredRatings((prev: any) => ({
                        ...prev,
                        [book.id]: null,
                      }))
                    }
                    onClick={() => {
                      setRating(index + 1);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bookshelves */}
            <div className="flex mb-3">
              <label className="font-semibold mb-1">Bookshelves:&ensp;</label>
              <p className="italic text-gray-600">
                {shelvesWithBook.length > 0
                  ? shelvesWithBook.map((shelf, index) => (
                      <span key={shelf}>
                        {shelf}
                        {index < shelvesWithBook.length - 1 && ", "}
                      </span>
                    ))
                  : " This book is not on any shelves."}
              </p>
            </div>

            <select
              className="px-4 py-2 rounded"
              value=""
              onChange={(e) => handleMoveBook(book.id, e.target.value)}
            >
              <option value="" disabled>
                Add to...
              </option>
              {/* Default Shelves */}
              <option value="Read">Read</option>
              <option value="Currently Reading">Currently Reading</option>
              <option value="To Read">To Read</option>

              {/* Custom Shelves */}
              {customShelves.sort().map((shelf) => (
                <option key={shelf} value={shelf}>
                  {shelf}
                </option>
              ))}
            </select>

            {/* PROGRESS */}
            {selectedShelf === "Currently Reading" && (
              <div className="flex items-center space-x-2 mt-4">
                <p className="font-semibold mb-1">Progress:</p>
                <input
                  type="number"
                  placeholder="Read"
                  defaultValue={book.pagesRead || 0}
                  className="p-1 border rounded w-20 text-center"
                  onChange={(e) => {
                    const pages = Number(e.target.value);
                    const pagesTotal = book.pagesTotal;
                    if (pages > pagesTotal && pagesTotal > 0) {
                      alert(
                        "Are you sure this is the number of pages you've read? You can't read more than the total number of pages."
                      );
                      return;
                    }
                    setNewPagesRead(Number(e.target.value));
                  }}
                />
                <p className="text-lg">/</p>
                <input
                  type="number"
                  placeholder="Total"
                  defaultValue={book.pagesTotal || 0}
                  className="p-1 border rounded w-20 text-center"
                  onChange={(e) => {
                    setNewPagesTotal(Number(e.target.value));
                  }}
                />
              </div>
            )}

            {/* Review */}
            <div className=" flex mb-4 mt-4">
              <p className="font-semibold mb-1 text-left">Review:&ensp;</p>
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                rows={3}
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              ></textarea>
            </div>

            {/* Quotes */}
            <div className="flex flex-col mb-4">
              <label className="font-semibold mb-1 text-left">Quotes:</label>
              {quotes.map((quote, index) => (
                <div className="flex items-center" key={index}>
                  <input
                    type="text"
                    value={quote}
                    onChange={(e) => handleQuoteChange(index, e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 mb-2"
                    placeholder="Add a quote"
                  />
                  <button
                    onClick={() => removeQuoteField(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                onClick={addQuoteField}
                className="text-blue-500 hover:text-blue-700 mt-2"
              >
                + Add another quote
              </button>
            </div>

            {/* Start of Reading Date */}
            <div className="flex items-center mb-4">
              <p className="font-semibold mb-1 text-left w-1/3">
                Start of Reading:&ensp;
              </p>
              <input
                type="date"
                className="w-1/2 border border-gray-300 rounded p-2"
                value={
                  startReadingDate instanceof Date &&
                  !isNaN(startReadingDate.getTime())
                    ? startReadingDate.toISOString().substring(0, 10)
                    : ""
                }
                onChange={(e) => {
                  const newDate = e.target.value;
                  setStartReadingDate(new Date(newDate));
                }}
              />
            </div>

            {/* Date Read */}
            <div className="flex items-center mb-4">
              <p className="font-semibold mb-1 text-left w-1/3">
                Date Read:&ensp;
              </p>
              <input
                type="date"
                className="w-1/2 border border-gray-300 rounded p-2"
                value={
                  readDate instanceof Date && !isNaN(readDate.getTime())
                    ? readDate.toISOString().substring(0, 10)
                    : ""
                }
                onChange={(e) => setReadDate(new Date(e.target.value))}
              />
            </div>

            {/* Add Reread Date */}
            <button
              onClick={() => setNewRereadDate(" ")}
              className="text-blue-500 hover:text-blue-700 mb-4"
            >
              + Add Reread Date
            </button>

            {/* Conditional input for new re-read date */}
            {newRereadDate !== "" && (
              <div className="flex gap-2 mb-4">
                <input
                  type="date"
                  value={book.rereadDates}
                  onChange={(e) => setNewRereadDate(e.target.value)}
                  className="px-2 py-1 border rounded-md"
                />
                <button
                  onClick={() => {
                    const updatedDates = [...rereadDates, newRereadDate];
                    setRereadDates(updatedDates);
                    setNewRereadDate("");
                  }}
                  className="bg-orange-300 text-white px-4 py-1 rounded-md"
                >
                  Save
                </button>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                className="w-fit bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md"
              >
                Save
              </button>
              <button onClick={handleClose}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookActions;
