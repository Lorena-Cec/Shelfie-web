import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import React from 'react';

interface IndustryIdentifier {
  type: string;
  identifier: string;
}

interface VolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  publishedDate?: string;
  imageLinks?: {
    thumbnail: string;
  };
  categories?: string[];
  industryIdentifiers?: IndustryIdentifier[];
}

interface Book {
  id: string;
  isbn: string;
  volumeInfo: VolumeInfo;
}

const BookDetails = () => {
  const router = useRouter();
  const { isbn } = router.query;
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [moreBooksByAuthor, setMoreBooksByAuthor] = useState<Book[]>([]);

  useEffect(() => {
    if (isbn) {
      fetchBookDetails(isbn as string);
    }
  }, [isbn]);

  const fetchBookDetails = async (isbn: string) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );

      const bookData: Book = response.data.items
        ? response.data.items[0]
        : null;
      if (bookData) {
        setBook(bookData);

        const author = bookData.volumeInfo.authors?.[0];
        if (author) {
          fetchMoreBooksByAuthor(author);
        }

        const categories = bookData.volumeInfo.categories || [];
        if (categories.length > 0) {
          fetchSimilarBooks(categories[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
    }
  };

  const fetchMoreBooksByAuthor = async (author: string) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=inauthor:${author}`
      );
      setMoreBooksByAuthor(response.data.items || []);
    } catch (error) {
      console.error('Error fetching books by author:', error);
    }
  };

  const fetchSimilarBooks = async (category: string) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${category}`
      );
      setRelatedBooks(response.data.items || []);
    } catch (error) {
      console.error('Error fetching similar books:', error);
    }
  };

  if (!book) {
    return <div>Loading...</div>;
  }

  const { volumeInfo } = book;
  const { title, authors, description, publishedDate, imageLinks, categories } =
    volumeInfo;

  return (
    <div className="container mx-auto p-8">
      <div className="flex">
        {/* Book Cover */}
        {imageLinks?.thumbnail && (
          <img
            src={imageLinks.thumbnail}
            alt={title}
            className="w-48 h-72 mr-8 shadow-lg"
          />
        )}
        <div>
          {/* Book Title and Info */}
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-lg">By: {authors?.join(', ')}</p>
          <p className="text-md">First published: {publishedDate || 'N/A'}</p>
          <p className="text-md mt-2">
            Genres: {categories?.join(', ') || 'N/A'}
          </p>
          {/* Book Description */}
          <p className="text-md mt-4">
            {description || 'No description available'}
          </p>
        </div>
      </div>

      {/* More Books by the Same Author */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          More books by {authors?.[0]}
        </h2>
        <div className="flex space-x-4">
          {moreBooksByAuthor.map((relatedBook) => (
            <div key={relatedBook.id} className="w-40">
              <img
                src={relatedBook.volumeInfo.imageLinks?.thumbnail}
                alt={relatedBook.volumeInfo.title}
                className="w-full h-auto shadow-lg"
              />
              <p className="text-md mt-2">{relatedBook.volumeInfo.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Books Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Similar Books</h2>
        <div className="flex space-x-4">
          {relatedBooks.map((similarBook) => (
            <div key={similarBook.id} className="w-40">
              <img
                src={similarBook.volumeInfo.imageLinks?.thumbnail}
                alt={similarBook.volumeInfo.title}
                className="w-full h-auto shadow-lg"
              />
              <p className="text-md mt-2">{similarBook.volumeInfo.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
