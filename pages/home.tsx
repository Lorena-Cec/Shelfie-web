import NavBar from '@/components/NavBar';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const Home: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]); // Stanje za pohranu knjiga
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Ovdje se može koristiti tvoj API ruter, npr. /api/books
        const response = await axios.get('/api/books?searchTerm=bestsellers'); // Možeš promijeniti pojam pretrage
        setBooks(response.data.items); // Postavi knjige u stanje
      } catch (err) {
        setError('Failed to fetch books.'); // Postavi grešku ako ne uspije
      } finally {
        setLoading(false); // Postavi loading na false nakon što završi
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className='flex flex-col flex-1 bg-orange-700'>
        <div className="flex flex-col gap-3 text-center items-center mt-32 mb-10">
          <p className='text-brown-100 open-sans text-4xl'>
            But first, let's take a Shelfie!
          </p>
          <p className='text-brown-200 font-thin'>
            Here you can shelf your books, review your stats and track your reading progress.
          </p>
        </div>

        {/* Prikaz trenutne knjige */}
        <div className='flex flex-col items-center bg-orange-400 p-8 mt-8 gap-3'>
          <p>Currently reading:</p>
          {loading ? (
            <p>Loading...</p> // Prikaz loading poruke dok se podaci učitavaju
          ) : error ? (
            <p>{error}</p> // Prikaz greške ako se dogodila
          ) : (
            books.slice(0, 1).map((book) => ( // Prikaz samo prve knjige iz rezultata
              <div className='flex gap-12' key={book.id}>
                <img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} className='w-32 h-44 bg-orange-100 shadow-3xl' />
                <div className='flex flex-col justify-between py-3'>
                  <p>{book.volumeInfo.title}</p>
                  <p>Progress: 30% left</p>
                  <Link href={`/books/${book.id}`}>Continue reading</Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Prikaz popularnih knjiga */}
        <div className='px-32'>
          <div className='pt-12 pb-8'>
            <p className='text-brown-100 open-sans text-3xl'>Popular now</p>
          </div>
          <div className='flex gap-24'>
            {loading ? (
              <p>Loading...</p> // Prikaz loading poruke dok se podaci učitavaju
            ) : error ? (
              <p>{error}</p> // Prikaz greške ako se dogodila
            ) : (
              books.slice(1, 5).map((book) => ( // Prikaz 4 knjige
                <div className='flex flex-col text-center gap-2' key={book.id}>
                  <img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} className='w-44 h-56 bg-orange-100 shadow-3xl mb-4' />
                  <p className='text-brown-200 font-thin'>{book.volumeInfo.title}</p>
                  <p className='text-brown-200 font-thin'>{book.volumeInfo.authors?.[0]}</p>
                  <p className='text-brown-200 font-thin'>Rating: {book.volumeInfo.averageRating || 'N/A'}</p>
                </div>
              ))
            )}
          </div>

          {/* Ostatak koda ostaje nepromijenjen */}
          <div className='pt-24 pb-8'>
                    <p className='text-brown-100 open-sans text-3xl'>Most read this week</p>
                </div>
                <div className='flex gap-10'>
                    <div className='flex gap-12 bg-orange-400 p-14 w-fit '>
                        <div className='w-56 h-72 bg-orange-100 shadow-brown-300 shadow-3xl'></div>
                        <div className='flex flex-col justify-between py-3'>
                            <div>
                                <p>Name of the book</p>
                                <p>Author</p>
                                <p>Rating</p>
                            </div>
                            <p className='w-96'>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                            </p>
                            <p>Read more...</p>
                        </div>
                    </div>

                    <div className='flex gap-12 bg-orange-400 p-14 w-fit '>
                        <div className='w-56 h-72 bg-orange-100 shadow-brown-300 shadow-3xl'></div>
                        <div className='flex flex-col justify-between py-3'>
                            <div>
                                <p>Name of the book</p>
                                <p>Author</p>
                                <p>Rating</p>
                            </div>
                            <p className='w-96'>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                            </p>
                            <p>Read more...</p>
                        </div>
                    </div>
                </div>
                <div className='py-12'>
                    <p className='text-brown-100 open-sans text-3xl'>Readers choice 2024</p>
                </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
