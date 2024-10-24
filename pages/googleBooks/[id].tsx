import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import React from 'react';
import NavBar from '@/components/NavBar';

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    imageLinks?: {
      thumbnail: string;
    };
    categories?: string[];
  };
}

const BookDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [moreBooksByAuthor, setMoreBooksByAuthor] = useState<Book[]>([]);

  useEffect(() => {
    if (id) {
      fetchBookDetails(id as string);
    }
  }, [id]);

  const fetchBookDetails = async (bookId: string) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes/${bookId}`
      );
      const bookData: Book = response.data;
      setBook(bookData);

      const author = bookData.volumeInfo.authors?.[0];
      if (author) {
        fetchMoreBooksByAuthor(author);
      }

      const categories = bookData.volumeInfo.categories || [];
      if (categories.length > 0) {
        fetchSimilarBooks(categories[0]);
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
    <div className="flex flex-col min-h-screen bg-orange-700">
      <NavBar></NavBar>
      <div className="flex items-center px-32 bg-orange-700">
        {/* Book Cover */}

        {imageLinks?.thumbnail ? (
          <img
            src={imageLinks.thumbnail}
            alt={title}
            className="w-48 h-72 mr-8 shadow-lg"
          />
        ) : (
          <p className="text-center text-gray-500">No Cover Image Available</p>
        )}

        <div className="p-16">
          {/* Book Title and Info */}
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-lg">By: {authors?.join(', ')}</p>
          <p className="text-md">First published: {publishedDate || 'N/A'}</p>
          <p className="text-md mt-2">
            Genres: {categories?.join(', ') || 'N/A'}
          </p>
          {/* Book Description */}
          <div
            className="text-md mt-4"
            dangerouslySetInnerHTML={{
              __html: description || 'No description available',
            }}
          />
        </div>
      </div>

      {/* More Books by the Same Author */}
      <div className="mt-20 px-32">
        <h2 className="text-2xl font-bold mb-4">
          More books by {authors?.[0]}
        </h2>
        <div className="flex space-x-4">
          {moreBooksByAuthor.map((relatedBook) => (
            <a
              href={`/googleBooks/${relatedBook.id}`}
              key={relatedBook.id}
              className="w-44 h-56"
            >
              {relatedBook.volumeInfo.imageLinks?.thumbnail ? (
                <img
                  src={relatedBook.volumeInfo.imageLinks.thumbnail}
                  alt={relatedBook.volumeInfo.title}
                  className="w-full h-full"
                />
              ) : (
                <p className="w-full h-full text-center text-gray-500">
                  No Image Available
                </p>
              )}
              <p className="text-md mt-2 text-center">
                {relatedBook.volumeInfo.title}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Similar Books Section */}
      <div className="mt-20 px-32">
        <h2 className="text-2xl font-bold mb-4">Similar Books</h2>
        <div className="flex space-x-4">
          {relatedBooks.map((similarBook) => (
            <a
              href={`/googleBooks/${similarBook.id}`}
              key={similarBook.id}
              className="w-44 h-56"
            >
              {similarBook.volumeInfo.imageLinks?.thumbnail ? (
                <img
                  src={similarBook.volumeInfo.imageLinks.thumbnail}
                  alt={similarBook.volumeInfo.title}
                  className="w-full h-full"
                />
              ) : (
                <p className="w-full h-full text-center text-gray-500">
                  No Image Available
                </p>
              )}
              <p className="text-md mt-2 text-center">
                {similarBook.volumeInfo.title}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
