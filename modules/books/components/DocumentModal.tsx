import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
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
  const [error, setError] = useState<string | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [totalSections, setTotalSections] = useState<number>(0);

  // Navigacija između sekcija
  const goToNextSection = async () => {
    if (rendition && currentSectionIndex < totalSections - 1) {
      const nextSection = book?.spine.get(currentSectionIndex + 1);
      if (nextSection?.href) {
        await rendition.display(nextSection.href);
        setCurrentSectionIndex(currentSectionIndex + 1);
      }
    }
  };

  const goToPreviousSection = async () => {
    if (rendition && currentSectionIndex > 0) {
      const previousSection = book?.spine.get(currentSectionIndex - 1);
      if (previousSection?.href) {
        await rendition.display(previousSection.href);
        setCurrentSectionIndex(currentSectionIndex - 1);
      }
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

          // Proverite spine i broj sekcija
          console.log("Spine content:", newBook.spine);

          // Prebrojte sekcije
          let sectionCount = 0;
          newBook.spine.each(() => sectionCount++);
          setTotalSections(sectionCount);
          console.log("Total sections:", sectionCount);

          // Uništi prethodni prikaz ako postoji
          if (rendition) rendition.destroy();

          const newRendition = newBook.renderTo(viewerRef.current, {
            width: "100%",
            height: "100%",
            flow: "scrolled",
          });
          setRendition(newRendition);
          const firstSection = newBook.spine.get(0); // Prva prava sekcija
          if (firstSection?.href) {
            await newRendition.display(firstSection.href);
          }
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
      <div className="relative bg-white rounded-lg shadow-lg w-2/3 h-full p-4 text-brown-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose}>
            <FaTimes className="text-2xl" />
          </button>
        </div>
        <div className="h-5/6 overflow-auto">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : isEpub ? (
            <div ref={viewerRef} style={{ height: "100%" }} className="view" />
          ) : (
            <iframe
              src={documentUrl}
              title="Document Viewer"
              className="w-full h-full"
              sandbox="allow-same-origin allow-popups allow-forms"
            />
          )}
        </div>
        {isEpub && (
          <div className="flex justify-between mt-4">
            <button
              onClick={goToPreviousSection}
              disabled={currentSectionIndex === 0}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Previous Section
            </button>
            <button
              onClick={goToNextSection}
              disabled={currentSectionIndex >= totalSections - 1}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Next Section
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentModal;
