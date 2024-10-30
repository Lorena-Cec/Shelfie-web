/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import NavBar from "@/components/NavBar";
import { ProfileData, useFirestore } from "@/modules/profilePage";
import { Autoplay } from "swiper/modules";
import { doc, getDoc } from "firebase/firestore";

const Profile: React.FC = () => {
  const {
    getProfileData,
    updateProfileImage,
    addFriend,
    removeFriend,
    sendInfo,
    getReadBooksThisYear,
  } = useFirestore();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isFriend, setIsFriend] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [readBooks, setReadBooks] = useState([]);
  const [currentlyReadingBooks, setCurrentlyReadingBooks] = useState<any[]>([]);
  const [recentBook, setRecentBook] = useState<any>(null);

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

  useEffect(() => {
    const fetchCurrentlyReadingBooks = async () => {
      if (!userId) return;

      try {
        const shelfRef = doc(
          db,
          "users",
          userId,
          "shelves",
          "Currently Reading"
        );
        const shelfSnap = await getDoc(shelfRef);

        if (shelfSnap.exists()) {
          setCurrentlyReadingBooks(shelfSnap.data().books || []);
        } else {
          console.log("No such shelf!");
          setCurrentlyReadingBooks([]);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchCurrentlyReadingBooks();
  }, [userId]);

  const fetchData = async () => {
    if (!userId) return;
    const fetchedReadBooks = await getReadBooksThisYear(userId);
    setReadBooks(fetchedReadBooks);
    const fetchMostRecent = await getMostRecentlyReadBook(userId);
    setRecentBook(fetchMostRecent);
    const data = await getProfileData(userId);
    if (data) {
      setProfileData(data);
      console.log(profileData);
      setIsFriend(data.friends?.includes(userId) || false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) return;
    if (e.target.files && e.target.files[0]) {
      const imageUrl = await updateProfileImage(userId, e.target.files[0]);
      setProfileData((prev) => ({ ...prev, imageUrl }));
      await sendInfo(imageUrl);
    }
  };

  const handleFriendClick = async () => {
    if (!userId) return;
    if (isFriend) {
      await removeFriend(userId);
      setIsFriend(false);
    } else {
      await addFriend(userId);
      setIsFriend(true);
    }
  };

  const getMostRecentlyReadBook = async (userId: string) => {
    const shelvesRef = doc(db, "users", userId, "shelves", "Read");
    const docSnap = await getDoc(shelvesRef);

    if (!docSnap.exists()) {
      console.log("No such document!");
      return null; // Return null if there's no document
    }

    const data = docSnap.data();
    const books = data.books || [];

    const booksWithReadDate = books.filter(
      (book: { readDate?: { toDate: () => Date }; title?: string }) =>
        book.readDate
    );

    if (booksWithReadDate.length === 0) {
      console.log("No books with read dates found.");
      return null;
    }

    booksWithReadDate.sort((a: { readDate: any }, b: { readDate: any }) => {
      const dateA = a.readDate!.toDate();
      const dateB = b.readDate!.toDate();
      return dateB.getTime() - dateA.getTime();
    });

    return booksWithReadDate[0];
  };

  const calculateRemainingPercentage = (
    pagesRead: number,
    totalPages: number
  ) => {
    console.log(pagesRead);
    console.log(totalPages);
    if (totalPages === 0 || pagesRead === 0) return 100;
    return Math.max(0, ((totalPages - pagesRead) / totalPages) * 100);
  };

  return (
    <div className="min-h-screen bg-orange-700 text-brown-100">
      <NavBar></NavBar>
      <div className="flex mt-20">
        {/* LEFT SIDE */}
        <div className="flex flex-col items-center w-1/4 pl-32">
          {/* Profile Image */}
          <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-4">
            <input
              type="file"
              onChange={handleImageUpload}
              className="hidden"
              id="profileImageInput"
            />
            {profileData.imageUrl ? (
              <img
                src={profileData.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <label
                htmlFor="profileImageInput"
                className="cursor-pointer flex items-center justify-center h-full text-gray-500"
              >
                Add Image
              </label>
            )}
          </div>

          {/* Friend Button */}
          <button
            className="px-4 py-2 bg-orange-500 text-white rounded-lg mb-4"
            onClick={handleFriendClick}
          >
            {isFriend ? "Friends" : "Add Friend"}
          </button>

          {/* Dropdown for "Friends" */}
          {isFriend && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-gray-500"
              >
                Friends ▼
              </button>
              {isDropdownOpen && (
                <div className="absolute bg-white shadow-md p-2 rounded">
                  <button onClick={handleFriendClick} className="text-red-500">
                    Remove Friend
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Friends List */}
          <h2 className="font-bold text-xl mt-8">Friends</h2>
          {profileData.friends && profileData.friends.length > 0 ? (
            <ul>
              {profileData.friends.map((friend, index) => (
                <li key={index} className="text-gray-700">
                  {friend}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Find friends</p>
          )}
        </div>

        {/* CENTER CONTENT */}
        <div className="flex flex-col items-center w-1/2">
          {/* Personal Info */}
          <h1 className="text-3xl font-bold">{profileData.name}</h1>
          <p>
            {profileData.city}, {profileData.country}
          </p>
          <p className="my-4 text-gray-600">{profileData.aboutMe}</p>

          {/* Hobbies */}
          <h3 className="font-semibold text-lg mt-4">Hobbies</h3>
          <p>{profileData.hobbies?.join(", ") || "Add your hobbies"}</p>

          {/* Favorites */}
          <h3 className="font-semibold text-lg mt-4">Favorite Books</h3>
          <div className="flex gap-4 flex-wrap">
            {profileData.favoriteBooks?.map((book) => (
              <div key={book.id} className="w-24 h-32 bg-gray-200">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )) || <p>No favorites yet.</p>}
          </div>

          {/* Recent Updates */}
          <h3 className="font-semibold text-lg mt-4">Recent Updates</h3>
          <ul>
            {profileData.recentUpdates?.slice(0, 5).map((update, index) => (
              <li key={index} className="text-gray-700">
                {update.title} - {update.action} on{" "}
                {new Date(update.timestamp).toLocaleDateString()}
              </li>
            )) || <p>No recent updates.</p>}
          </ul>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col w-1/3 pr-32">
          {/* Reading Challenge */}
          <div className="flex flex-col items-center w-full">
            <div className="bg-orange-300 flex py-5 gap-10 items-center w-full justify-center">
              <img src="/wallpaper.png" alt="Book" className="w-32" />
              <p className="text-brown-100 font-extrabold tracking-tighter text-3xl w-80">
                Challenge yourself this year!
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

          {/* Currently Reading */}
          <div>
            <h3 className="font-semibold text-lg mt-8">Currently Reading</h3>
            <Swiper
              slidesPerView={1}
              loop={true}
              modules={[Autoplay]}
              autoplay={{
                delay: 10000,
                disableOnInteraction: false,
              }}
            >
              {currentlyReadingBooks.map((book) => {
                const remainingPercentage = calculateRemainingPercentage(
                  book.pagesRead,
                  book.pagesTotal
                );
                return (
                  <SwiperSlide key={book.id} className="flex items-center">
                    <div className="flex gap-2 px-5 pb-7 pt-3">
                      <a
                        href={`/googleBooks/${book.id}`}
                        className="shadow-3xl w-32 h-44"
                      >
                        <img
                          src={book.image}
                          alt={book.title}
                          className="w-32 h-44 object-cover"
                        />
                      </a>
                      <div className="flex flex-col justify-between py-5 pl-5">
                        <p className="text-brown-200 font-extrabold w-4/5 max-w-[15rem]">
                          {book.title}
                        </p>
                        <p className="text-brown-300">
                          Progress: {remainingPercentage.toFixed(0)}% left
                        </p>
                        <a
                          href="/shelves/Currently%20Reading"
                          className="text-orange-200 hover:underline"
                        >
                          Update progress
                        </a>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          {/* Recently Read */}
          <h3 className="font-semibold text-lg mt-4">Recently Read</h3>
          {recentBook && (
            <div className="flex gap-2 px-5 pb-7 pt-3">
              <a href={`/googleBooks/${recentBook.id}`} className="shadow-3xl">
                <img
                  src={recentBook.image}
                  alt={recentBook.title}
                  className="w-32 h-44"
                />
              </a>
              <div className="flex flex-col justify-between py-5 pl-5">
                <p className="text-brown-200 font-extrabold w-4/5">
                  {recentBook.title}
                </p>
                <div className="flex space-x-px">
                  {Array.from({ length: 5 }, (_, index) => (
                    <img
                      key={index}
                      src={`/stars${index < recentBook.rating ? index + 1 : 0}.png`}
                      alt={`${index + 1} star`}
                      className="w-7 h-7"
                    />
                  ))}
                </div>
                <a href="/shelves/Read" className="text-orange-200">
                  Edit Read Book
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
