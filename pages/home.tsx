import NavBar from '@/components/NavBar';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { Navigation } from 'swiper/modules';


interface Book {
  primary_isbn13: string;
  title: string;
  author: string;
  rank?: number;
  book_image?: string;
  description?: string;
}

interface BookList {
  listType: string; 
  books: Book[];
}

const Home: React.FC = () => {
  const [booksByList, setBooksByList] = useState<BookList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const listTypes = [
    'combined-print-and-e-book-fiction',
    'graphic-books-and-manga',
    'young-adult-hardcover',
    'trade-fiction-paperback'
  ];

  useEffect(() => {
    const fetchNytBooks = async () => {
      setLoading(true);
      setError(null);
      const fetchedBooks: BookList[] = [];
  
      try {
        
        const storedBooks = localStorage.getItem('nytBooks');
        if (storedBooks) {
          setBooksByList(JSON.parse(storedBooks));
        } else {
          
          for (const listType of listTypes) {
            const response = await axios.get(`/api/nytBooks?listType=${listType}`);
            const limitedBooks = response.data.slice(0, 7); 
            fetchedBooks.push({ listType, books: limitedBooks });
            await new Promise(resolve => setTimeout(resolve, 1000)); 
          }
          
          localStorage.setItem('nytBooks', JSON.stringify(fetchedBooks));
          setBooksByList(fetchedBooks);
        }
      } catch (err) {
        console.error(err); 
        setError('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };
  
    fetchNytBooks();
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

        <div className='px-32'>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            booksByList.map((list, index) => (
              <div key={index}>
                <div className='pt-12 pb-8'>
                  <p className='text-brown-100 open-sans text-3xl'>
                    {list.listType === 'combined-print-and-e-book-fiction' 
                      ? 'Popular Now' 
                      : list.listType.replace(/-/g, ' ').replace('and', '&')}
                  </p>
                </div>
                <div className='flex gap-24'>
                  {list.listType === 'graphic-books-and-manga' && (
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={40} 
                      slidesPerView={2.3} 
                      grabCursor={true}
                      loop={true}
                    >
                      {list.books.slice(0, 5).map((book: Book) => (
                        <SwiperSlide key={book.primary_isbn13}>
                          <div className='flex gap-12 bg-orange-400 p-10 w-fit'>
                            <div
                              className='w-56 h-72 bg-orange-100 shadow-brown-300 shadow-3xl'
                              style={{
                                backgroundImage: `url(${book.book_image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            >
                              {!book.book_image && (
                                <p className='flex items-center justify-center h-full'>No Image Available</p>
                              )}
                            </div>
                            <div className='flex flex-col justify-between py-3'>
                              <div>
                                <p className='font-bold'>{book.title || 'No Title Available'}</p>
                                <p>{book.author || 'No Author Available'}</p>
                              </div>
                              <p className='w-80'>
                                {book.description || 'No Description Available'}
                              </p>
                              <p className='text-blue-500 cursor-pointer'>Read more...</p>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}

                  {list.listType === 'combined-print-and-e-book-fiction' && list.books.slice(0, 7).map((book: Book) => (
                    <div className='flex flex-col text-center gap-2' key={book.primary_isbn13}>
                      <p className='text-brown-200 font-bold text-3xl'>{book.rank || 'N/A'}</p>
                      {book.book_image ? (  
                        <img 
                          src={book.book_image}  
                          alt={book.title} 
                          className='w-44 h-56 bg-orange-100 shadow-3xl mb-4' 
                        />
                      ) : (
                        <div className='w-44 h-56 bg-gray-200 shadow-3xl mb-4 flex items-center justify-center'>
                          <p>No Image Available</p>
                        </div>
                      )}
                      <p className='text-brown-200 font-thin'>{book.title || 'No Title Available'}</p> 
                      <p className='text-brown-200 font-thin'>{book.author || 'No Author Available'}</p>
                    </div>
                  ))}

                  {list.listType === 'young-adult-hardcover' && (
                    <div className='bg-orange-300 flex w-full gap-4 p-4'>
                      {list.listType === 'young-adult-hardcover' && list.books.slice(0, 4).map((book: Book) => (
                        <div className='flex flex-col items-center text-center gap-2 w-1/4' key={book.primary_isbn13}>
                          {book.book_image ? (  
                            <img 
                              src={book.book_image}  
                              alt={book.title} 
                              className='w-44 h-56 bg-orange-100 shadow-3xl mb-4' 
                            />
                          ) : (
                            <div className='w-44 h-56 bg-gray-200 shadow-3xl mb-4 flex items-center justify-center'>
                              <p>No Image Available</p>
                            </div>
                          )}
                          <p className='text-brown-200 font-thin'>{book.title || 'No Title Available'}</p> 
                          <p className='text-brown-200 font-thin'>{book.author || 'No Author Available'}</p>
                        </div>
                      ))}
                      
                        <img src="/wallpaper.png" alt="Wallpaper" className='w-80' />
                      
                    </div>
                  )}

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
