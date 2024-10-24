import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import React from 'react';
import NavBar from '@/components/NavBar';
import ShelfButtons from '@/modules/books/components/ShelfButtons';

interface Book {
  id: string;
  title: string;
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

  useEffect(() => {
    if (id) {
      fetchBookDetails(id as string);
    }
  }, [id]);

  if (!book) {
    return <div>Loading...</div>;
  }

  const bookData = book;

  const { volumeInfo } = book;
  const { title, authors, description, publishedDate, imageLinks, categories } =
    volumeInfo;

  return (
    <div className="flex flex-col bg-orange-700">
      <NavBar></NavBar>
      <div className="flex items-start px-40 pt-20 bg-orange-700">
        {/* Book Cover and Shelf Buttons */}
        <div className="flex flex-col gap-10 py-16 px-5">
          <div className="w-56 h-80">
            {imageLinks?.thumbnail ? (
              <img
                src={imageLinks.thumbnail}
                alt={title}
                className="w-full h-full mr-8 shadow-3xl"
              />
            ) : (
              <p className="text-center text-gray-500">
                No Cover Image Available
              </p>
            )}
          </div>

          <div>
            <ShelfButtons book={bookData} />
          </div>
        </div>

        <div className="p-16">
          {/* Book Title and Info */}
          <h1 className="text-4xl font-extrabold mb-2 text-brown-100">
            {title}
          </h1>
          <p className="text-xl text-brown-200">By: {authors?.join(', ')}</p>
          <p className="text-md text-brown-300">
            First published: {publishedDate || 'N/A'}
          </p>

          {/* Book Description */}
          <div
            className=" mt-4 text-brown-200"
            dangerouslySetInnerHTML={{
              __html: description || 'No description available',
            }}
          />
          <div className="flex mt-10 ">
            <p className="text-md font-bold text-brown-200 mr-2">GENRES:</p>
            <div className="flex">
              {categories && categories.length > 0
                ? categories.slice(0, 3).map((category, index) => (
                    <p
                      key={index}
                      className="italic text-mdmr-2 text-brown-200"
                    >
                      {category},
                    </p>
                  ))
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* More Books by the Same Author */}
      <div className="my-20 px-32 text-brown-100">
        <h2 className="text-2xl font-bold mb-4">
          More books by {authors?.[0]}
        </h2>
        <div className="flex justify-between">
          {moreBooksByAuthor.slice(0, 8).map((relatedBook) => (
            <a
              href={`/googleBooks/${relatedBook.id}`}
              key={relatedBook.id}
              className="w-44 h-60"
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
      <div className="mt-20 px-32 text-brown-100 pb-32">
        <h2 className="text-2xl font-bold mb-4">Similar Books</h2>
        <div className="flex justify-between">
          {relatedBooks.slice(0, 8).map((similarBook) => (
            <a
              href={`/googleBooks/${similarBook.id}`}
              key={similarBook.id}
              className="w-44 h-60"
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
