/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Book } from "../models/Book";
import BookActions from "./BookActionsButtons";
import { Timestamp } from "firebase/firestore";
import { FaUpload, FaBook } from "react-icons/fa";
import { storage } from "@/lib/firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import DocumentModal from "./DocumentModal";

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
  books = [],
  hoveredRatings = {},
  setHoveredRatings,
  handleUpdateBook,
}) => {
  const [documentToView, setDocumentToView] = useState<string | null>(null);
  const [viewTitle, setViewTitle] = useState<string>("");

  const formatDate = (date: any) => {
    return date instanceof Timestamp
      ? date.toDate().toLocaleDateString()
      : "N/A";
  };

  const uploadFile = async (
    file: File,
    bookId: string,
    existingFileUrl?: string
  ): Promise<string> => {
    try {
      if (existingFileUrl) {
        const oldFileRef = ref(storage, existingFileUrl);
        await deleteObject(oldFileRef);
      }

      const fileRef = ref(storage, `books/${bookId}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileUpload = async (
    book: Book,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      try {
        const uploadedUrl = await uploadFile(
          file,
          book.id,
          book.uploadedDocument
        );
        await handleUpdateBook(book.id, "uploadedDocument", uploadedUrl);
      } catch (error) {
        console.error("Failed to upload and update file URL:", error);
      }
    }
  };

  return (
    <div className="text-center mt-8 w-full">
      {books.length === 0 ? (
        <div>
          <p className="p-2 mt-5 text-brown-100">Empty bookshelf.</p>
          <p className="text-sm mb-5 text-brown-100">
            Add books to {shelfName} -{" "}
            <a href="/search" className="text-orange-300">
              Browse here
            </a>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-4">
          <div
            className={`grid ${
              shelfName === "To Read"
                ? "grid-cols-7"
                : shelfName === "Currently Reading"
                  ? "grid-cols-9"
                  : "grid-cols-8"
            } gap-4 px-16 py-4 font-bold bg-orange-300 text-brown-700`}
          >
            <div></div>
            <p>TITLE & AUTHOR</p>
            {shelfName !== "To Read" && <p>RATING</p>}
            {shelfName === "Currently Reading" && <p>PROGRESS</p>}
            <p>ADDED DATE</p>
            <p>START OF READING</p>
            <p>READ DATE</p>
            <p>E-BOOK</p> {/* New E-BOOK Column */}
            <div></div>
          </div>

          <div className="mb-2 flex flex-col gap-2">
            {books.map((book) => (
              <div
                key={book.id}
                className={`grid ${
                  shelfName === "To Read"
                    ? "grid-cols-7"
                    : shelfName === "Currently Reading"
                      ? "grid-cols-9"
                      : "grid-cols-8"
                } gap-4 place-items-center px-16 py-8 bg-orange-600 text-brown-100`}
              >
                {/* COVER */}
                <a href={`/googleBooks/${book.id}`}>
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-24 h-40 shadow-3xl"
                  />
                </a>

                {/* Title and Authors */}
                <div>
                  <p className="text-lg font-bold">{book.title}</p>
                  <p>{book.authors?.join(", ")}</p>
                </div>

                {/* RATING */}
                {shelfName !== "To Read" && (
                  <div className="flex space-x-px">
                    {Array.from({ length: 5 }, (_, index) => (
                      <img
                        key={index}
                        src={`/stars${index < (hoveredRatings?.[book.id] ?? book.rating ?? 0) ? index + 1 : 0}.png`}
                        alt={`${index + 1} star`}
                        className="w-7 h-7 cursor-pointer"
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
                    <p className="text-lg">{book.pagesRead}</p>
                    <p className="text-lg">/</p>
                    <p className="text-lg">{book.pagesTotal}</p>
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

                {/* UPLOAD */}
                <div className="flex flex-col items-center gap-4">
                  <label
                    htmlFor={`upload-${book.id}`}
                    className="cursor-pointer"
                  >
                    <FaUpload className="text-2xl" />
                  </label>
                  <input
                    type="file"
                    id={`upload-${book.id}`}
                    className="hidden"
                    accept=".pdf,.epub"
                    onChange={(event) => handleFileUpload(book, event)}
                  />

                  {book.uploadedDocument && (
                    <FaBook
                      className="text-2xl cursor-pointer"
                      onClick={() => {
                        setDocumentToView(book.uploadedDocument);
                        setViewTitle(book.title);
                      }}
                    />
                  )}
                </div>

                {/* EDIT, DELETE & MOVE ACTIONS */}
                <BookActions book={book}></BookActions>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal za prikaz dokumenta */}
      {documentToView && (
        <DocumentModal
          documentUrl={documentToView}
          title={viewTitle}
          onClose={() => setDocumentToView(null)}
        />
      )}
    </div>
  );
};

export default ShelfDisplay;
