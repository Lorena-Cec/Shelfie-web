import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { ProfileData, useFirestore } from "@/modules/profilePage";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const ChallengeScreen: React.FC = () => {
  const { getProfileData, getReadBooksThisYear } = useFirestore();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [readBooks, setReadBooks] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    if (!userId) return;
    const fetchedReadBooks = await getReadBooksThisYear(userId);
    setReadBooks(fetchedReadBooks);
    const data = await getProfileData(userId);
    if (data) {
      setProfileData(data);
    }
  };

  return (
    <div className="min-h-screen bg-orange-700 text-brown-100">
      <NavBar></NavBar>
      {/* Reading Challenge */}
      <div className="flex flex-col items-center w-full">
        <div className="bg-orange-300 flex py-5 gap-10 items-center w-full justify-center">
          <p className="text-brown-100 font-extrabold tracking-tighter text-5xl">
            YOUR YEAR IN BOOKS SO FAR
          </p>
        </div>
        <div className="bg-brown-700 w-full flex items-center flex-col">
          <p>{profileData.name} has read</p>
          <p className="text-5xl font-bold">
            {" "}
            {readBooks.length} / {profileData.booksToRead}
          </p>
          <p>books this year</p>
        </div>

        <a
          className="rounded text-white text-center bg-orange-300 w-full py-4"
          href="/"
        >
          View Read Books
        </a>
      </div>
    </div>
  );
};

export default ChallengeScreen;
