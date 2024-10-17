import React, { useState } from 'react';
import NavNewUser from '@/components/NavNewUser';
import { useRouter } from 'next/router';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig'; // auth is needed to access the current user

const Home: React.FC = () => {
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [favoriteBook, setFavoriteBook] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [otherHobby, setOtherHobby] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false); // For showing custom hobby input
  
  const router = useRouter();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const allHobbies = [
    "Bookbinding",
    "Drawing",
    "Writing",
    "Painting",
    "Photography",
    "Videography",
    "Other"
  ];

  const toggleHobby = (hobby: string) => {
    if (hobbies.includes(hobby)) {
      setHobbies(hobbies.filter(h => h !== hobby)); // Ukloni hobi ako je već odabran
    } else {
      setHobbies([...hobbies, hobby]); // Dodaj hobi
    }
  };

  const sendInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = auth.currentUser; 
    if (user) {
      const finalHobbies = isOtherSelected && otherHobby ? [...hobbies.filter(h => h !== "Other"), otherHobby] : hobbies;

      await setDoc(doc(db, 'users', user.uid), {
        ProfileInfo: {  
          city,
          country,
          favoriteBook,
          aboutMe,
          hobbies: finalHobbies,
        },
      }, { merge: true }); 
    }
};


  return (
    <div className="flex flex-col h-screen">
      <NavNewUser />
      <div className="flex flex-col items-center bg-orange-700">
        <div className="flex flex-col gap-3 items-start mt-20 mb-10">
          <p className='text-brown-100 open-sans text-2xl'>
            Setup your profile
          </p>
          <p className='text-brown-200 font-thin'>
            Tell people a little about yourself, where you are from and what interests you have.
          </p>
        </div>
        
        <form onSubmit={sendInfo} className="space-y-3 w-1/3 bg-white border border-orange-400 rounded-lg p-24 mb-10">

            <p className='text-brown-100 text-xs'>CITY</p>
            <input
                type="text"
                placeholder="Paris"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />

            <p className='text-brown-100 text-xs'>COUNTRY</p>
            <input
                type="text"
                placeholder="France"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />

            <p className='text-brown-100 text-xs'>FAVORITE BOOK</p>
            <input
                type="text"
                placeholder="Favorite Book"
                value={favoriteBook}
                onChange={(e) => setFavoriteBook(e.target.value)}
                className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />

            <p className='text-brown-100 text-xs'>ABOUT ME</p>
            <textarea
                placeholder="Tell us about yourself..."
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />

            <div className=''>
            <p className='text-brown-100 text-xs'>HOBBIES</p>
            
            <div className="relative">
                <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400 text-left"
                >
                {hobbies.length > 0 ? hobbies.join(', ') : 'Select hobbies'}
                </button>

                {isDropdownOpen && (
                <div className="absolute bg-white border border-gray-300 mt-1 w-full z-10">
                    {allHobbies.map((hobby) => (
                    <div key={hobby} className="flex items-center p-2 hover:bg-orange-100 cursor-pointer">
                        <input 
                        type="checkbox" 
                        checked={hobbies.includes(hobby)} 
                        onChange={() => toggleHobby(hobby)} 
                        className="mr-2"
                        />
                        <label className='text-brown-100 '>{hobby}</label>
                    </div>
                    ))}
                </div>
                )}
            </div>
            
            {/* Show input field if 'Other' is selected */}
            {hobbies.includes("Other") && (
                <input
                type="text"
                placeholder="Other hobby"
                onChange={(e) => setOtherHobby(e.target.value)}
                className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400 mt-2"
                />
            )}
            </div>

            <button type="submit" className="w-full bg-orange-100 text-white py-2 rounded-md hover:bg-blue-600">
                Save Profile Settings
            </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
