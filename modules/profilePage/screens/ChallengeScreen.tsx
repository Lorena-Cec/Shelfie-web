import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { ProfileData, useFirestore } from "@/modules/profilePage";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import DonutChart from "../components/DonutChart";

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
    <div className="min-h-screen bg-brown-700 text-brown-100">
      <NavBar></NavBar>
      {/* Reading Challenge */}
      <div className="flex flex-col items-center w-full">
        <div className="bg-orange-300 w-full">
          <div className="flex py-5 gap-10 items-center w-full justify-center">
            <img src="book.png" alt="Open book" className="w-40 h-auto" />
            <p className="text-brown-100 font-extrabold tracking-tighter text-5xl">
              Reading <br></br> Challenge
            </p>
          </div>
        </div>
        <div className="bg-orange-700 w-full h-16 flex items-center flex-col"></div>
      </div>
      <DonutChart
        booksRead={readBooks.length}
        readingGoal={profileData.booksToRead ?? 0}
      />
    </div>
  );
};

export default ChallengeScreen;
