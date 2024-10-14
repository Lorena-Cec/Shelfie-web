import NavBar from '@/components/NavBar';
import React from 'react';
import Link from 'next/link';

const Home: React.FC = () => {

  return (
    <div className="flex flex-col h-screen">
        <NavBar />
        <div className='flex flex-col flex-1 bg-primary-700'>
            <div className="flex flex-col gap-3 text-center items-center mt-32 mb-10">
                <p className='text-primary-100 open-sans text-4xl'>
                But first, let's take a Shelfie!
                </p>
                <p className='text-primary-200 font-thin'>
                    Here you can shelf your books, review your stats and track your reading progress.
                </p>
            </div>
            <div className='flex flex-col items-center bg-primary-400 p-8 mt-8 gap-3'>
                <p>Currently reading:</p>
                <div className='flex gap-12'>
                    <div className='w-32 h-44 bg-primary-100 shadow-primary-300 shadow-3xl'></div>
                    <div className='flex flex-col justify-between py-3'>
                            <p>Name of the book</p>
                            <p>Progress: 30% left</p>
                            <p>Continue reading</p>
                    </div>
                </div>
            </div>
            <div className='px-32'>
                <div className='pt-12 pb-8'>
                    <p className='text-primary-100 open-sans text-3xl'>Popular now</p>
                </div>
                <div className='flex gap-24'>
                    <div className='flex flex-col text-center gap-2'>
                        <div className='w-44 h-56 bg-primary-100 shadow-gray-400 shadow-3xl mb-4'></div>
                        <p className='text-primary-200 font-thin'>Name of the book</p>
                        <p className='text-primary-200 font-thin'>Author</p>
                        <p className='text-primary-200 font-thin'>Rating</p>
                    </div>
                    <div className='flex flex-col text-center gap-2'>
                        <div className='w-44 h-56 bg-primary-100 shadow-gray-400 shadow-3xl mb-4'></div>
                        <p className='text-primary-200 font-thin'>Name of the book</p>
                        <p className='text-primary-200 font-thin'>Author</p>
                        <p className='text-primary-200 font-thin'>Rating</p>
                    </div>
                    <div className='flex flex-col text-center gap-2'>
                        <div className='w-44 h-56 bg-primary-100 shadow-gray-400 shadow-3xl mb-4'></div>
                        <p className='text-primary-200 font-thin'>Name of the book</p>
                        <p className='text-primary-200 font-thin'>Author</p>
                        <p className='text-primary-200 font-thin'>Rating</p>
                    </div>
                    <div className='flex flex-col text-center gap-2'>
                        <div className='w-44 h-56 bg-primary-100 shadow-gray-400 shadow-3xl mb-4'></div>
                        <p className='text-primary-200 font-thin'>Name of the book</p>
                        <p className='text-primary-200 font-thin'>Author</p>
                        <p className='text-primary-200 font-thin'>Rating</p>
                    </div>
                </div>

                <div className='pt-24 pb-8'>
                    <p className='text-primary-100 open-sans text-3xl'>Most read this week</p>
                </div>
                <div className='flex gap-10'>
                    <div className='flex gap-12 bg-primary-400 p-14 w-fit '>
                        <div className='w-56 h-72 bg-primary-100 shadow-primary-300 shadow-3xl'></div>
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

                    <div className='flex gap-12 bg-primary-400 p-14 w-fit '>
                        <div className='w-56 h-72 bg-primary-100 shadow-primary-300 shadow-3xl'></div>
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
                    <p className='text-primary-100 open-sans text-3xl'>Readers choice 2024</p>
                </div>
            </div>
            
           
        </div>

    </div>
  );
};

export default Home;