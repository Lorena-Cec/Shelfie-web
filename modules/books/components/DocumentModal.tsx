import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import ePub, { Rendition, Book } from "epubjs";

interface DocumentModalProps {
  documentUrl: string;
  title: string;
  onClose: () => void;
}

const DocumentModal: React.FC<DocumentModalProps> = ({
  documentUrl,
  title,
  onClose,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const isEpub = documentUrl.includes(".epub");
  const isPdf = documentUrl.includes(".pdf");
  const [error, setError] = useState<string | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [, setBook] = useState<Book | null>(null);

  const goToNextPage = async () => {
    if (rendition) {
      await rendition.next();
    }
  };

  const goToPreviousPage = async () => {
    if (rendition) {
      await rendition.prev();
    }
  };

  useEffect(() => {
    const loadDocument = async () => {
      try {
        if (isEpub && viewerRef.current) {
          const newBook = ePub(documentUrl);
          setBook(newBook);

          newBook.on("error", (err: unknown) => {
            console.error("Error loading book:", err);
            setError(`Failed to load document: ${err}`);
          });

          await newBook.loaded;

          await newBook.loaded.navigation;

          console.log("Spine content:", newBook.spine);

          let sectionCount = 0;
          newBook.spine.each(() => sectionCount++);
          console.log("Total sections:", sectionCount);

          if (rendition) rendition.destroy();

          const newRendition = newBook.renderTo(viewerRef.current, {
            width: "100%",
            height: "100%",
            flow: "paginated",
            spread: "auto",
          });
          setRendition(newRendition);
          const firstSection = newBook.spine.get(0);
          if (firstSection?.href) {
            await newRendition.display(firstSection.href);
          }
        } else if (isPdf) {
          setError(null);
        } else {
          throw new Error("Invalid document or viewer reference");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to load document: ${errorMessage}`);
        console.error("Error loading document:", errorMessage);
      }
    };

    loadDocument();

    return () => {
      if (rendition) rendition.destroy();
    };
  }, [documentUrl, isEpub]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-lg w-2/3 h-0.9 p-4 text-brown-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose}>
            <FaTimes className="text-2xl" />
          </button>
        </div>
        <div
          className={`${isEpub ? "h-5/6" : "h-full"} overflow-hidden relative`}
        >
          {" "}
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : isEpub ? (
            <div
              ref={viewerRef}
              style={{
                height: "100%",
              }}
              className="view"
            />
          ) : isPdf ? (
            <iframe
              src={documentUrl}
              title="Document Viewer"
              className="w-full"
              style={{
                height: "94%",
              }}
            />
          ) : null}
          {isEpub && (
            <>
              <button
                onClick={goToPreviousPage}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 pr-2"
              >
                <FaChevronLeft className="text-2xl" />
              </button>
              <button
                onClick={goToNextPage}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 pl-2"
              >
                <FaChevronRight className="text-2xl" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
