/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { auth, db } from "@/lib/firebaseConfig";
import NavBar from "@/components/NavBar";
import { ProfileData, useFirestore } from "@/modules/profilePage";
import { Autoplay } from "swiper/modules";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { getBooksToReadForYear } from "../hooks/setReadingGoal";
import { GoalPopup } from "../components/GoalPopup";

const ProfileScreen: React.FC<{ userId: string }> = ({ userId }) => {
  const {
    getProfileData,
    updateProfileImage,
    addFollow,
    unfollowUser,
    sendInfo,
    getReadBooksThisYear,
  } = useFirestore();

  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [readBooks, setReadBooks] = useState([]);
  const [currentlyReadingBooks, setCurrentlyReadingBooks] = useState<any[]>([]);
  const [recentBook, setRecentBook] = useState<any>(null);
  const [favoriteBooks, setFavoriteBooks] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowingDropdownOpen, setIsFollowingDropdownOpen] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, currentUserId]);

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

  useEffect(() => {
    const fetchFavoriteBooks = async () => {
      if (!userId) return;

      try {
        const shelfRef = doc(db, "users", userId, "shelves", "Read");
        const shelfSnap = await getDoc(shelfRef);

        if (shelfSnap.exists()) {
          const booksWithBestRating = (shelfSnap.data().books || []).filter(
            (book: { rating: number }) => book.rating === 5
          );
          setFavoriteBooks(booksWithBestRating);
        } else {
          console.log("No such shelf!");
          setFavoriteBooks([]);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchFavoriteBooks();
  }, [userId]);

  const fetchData = async () => {
    if (!currentUserId || !userId) return;
    const fetchedReadBooks = await getReadBooksThisYear(userId);
    setReadBooks(fetchedReadBooks);
    const fetchMostRecent = await getMostRecentlyReadBook(userId);
    setRecentBook(fetchMostRecent);
    const fetchRecentUpdates = await getMostRecentUpdates(userId);
    setRecentUpdates(fetchRecentUpdates);

    if (currentUserId == userId) {
      const data = await getProfileData(userId);
      if (data) {
        setProfileData(data);
        setIsFollowing(data.following?.includes(currentUserId) || false);
      }
    } else {
      const data = await getProfileData(userId);
      if (data) {
        setProfileData(data);
      }
      const dataFollow = await getProfileData(currentUserId);
      if (dataFollow) {
        setIsFollowing(dataFollow.following?.includes(userId) || false);
      }
    }
  };

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkGoal = async () => {
      const goal = await getBooksToReadForYear(userId, currentYear);

      if (!goal) {
        setShowPopup(true);
      }
    };

    checkGoal();
  }, [userId]);

  console.log(isFollowing);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) return;
    if (e.target.files && e.target.files[0]) {
      const imageUrl = await updateProfileImage(userId, e.target.files[0]);
      setProfileData((prev) => ({ ...prev, imageUrl }));
      await sendInfo(imageUrl);
    }
  };

  const [followersDetails, setFollowersDetails] = useState<any[]>([]);

  useEffect(() => {
    const fetchFollowersDetails = async () => {
      const followersPromises = (profileData.followers || []).map(
        async (followerId) => {
          const followerRef = doc(db, "users", followerId);
          const followerSnap = await getDoc(followerRef);

          if (followerSnap.exists()) {
            const followerData = followerSnap.data();
            return {
              id: followerId,
              name: followerData.name || "Unknown",
              imageUrl: followerData.ProfileInfo?.imageUrl || "",
            };
          }
          return null;
        }
      );

      const followersData = await Promise.all(followersPromises);
      setFollowersDetails(followersData.filter(Boolean)); // Filtriraj null vrijednosti
    };

    if (profileData?.followers?.length) {
      fetchFollowersDetails();
    }
  }, [profileData?.followers]); // Ovdje promjena prati "followers"

  const [followingDetails, setFollowingDetails] = useState<any[]>([]);

  useEffect(() => {
    const fetchFollowingDetails = async () => {
      const followingPromises = (profileData.following || []).map(
        async (followingId) => {
          const followingRef = doc(db, "users", followingId);
          const followingSnap = await getDoc(followingRef);

          if (followingSnap.exists()) {
            const followingData = followingSnap.data();
            return {
              id: followingId,
              name: followingData.name || "Unknown",
              imageUrl: followingData.ProfileInfo?.imageUrl || "",
            };
          }
          return null;
        }
      );

      const followingData = await Promise.all(followingPromises);
      setFollowingDetails(followingData.filter(Boolean));
    };

    if (profileData?.following?.length) {
      fetchFollowingDetails();
    }
  }, [profileData?.following]);

  const handleFollowClick = async () => {
    if (!currentUserId || !userId) return;

    if (isFollowing) {
      await unfollowUser(currentUserId, userId);
      setIsFollowing(false);
    } else {
      await addFollow(currentUserId, userId);
      setIsFollowing(true);
    }
  };

  const handleUnfollow = async (id: string) => {
    if (!currentUserId) return;
    await unfollowUser(currentUserId, id);
    fetchData(); // Refresh the following list
  };

  const getMostRecentlyReadBook = async (userId: string) => {
    const shelvesRef = doc(db, "users", userId, "shelves", "Read");
    const docSnap = await getDoc(shelvesRef);

    if (!docSnap.exists()) {
      console.log("No such document!");
      return null;
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

  const getMostRecentUpdates = async (userId: string) => {
    const shelvesRef = collection(db, "users", userId, "shelves");
    const querySnapshot = await getDocs(shelvesRef);

    if (querySnapshot.empty) {
      console.log("No shelves found.");
      return [];
    }

    let recentUpdates: {
      id: string;
      title: string;
      type: string;
      timestamp: string;
      rating?: number;
      image?: string;
      authors?: string[];
      shelfName: string;
    }[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const books = data.books || [];
      const shelfName = doc.id;

      books.forEach((book: any) => {
        if (book.recentAdd) {
          recentUpdates.push({
            id: book.id,
            title: book.title,
            type: "Added",
            timestamp: book.recentAdd,
            rating: book.rating || 0,
            image: book.image || "",
            authors: book.authors || [],
            shelfName,
          });
        }

        if (book.recentRating) {
          recentUpdates.push({
            id: book.id,
            title: book.title,
            type: "Rated",
            timestamp: book.recentRating,
            rating: book.rating || 0,
            image: book.image || "",
            authors: book.authors || [],
            shelfName,
          });
        }
      });
    });

    recentUpdates.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return recentUpdates.slice(0, 10);
  };

  const calculateRemainingPercentage = (
    pagesRead: number,
    totalPages: number
  ) => {
    if (totalPages === 0 || pagesRead === 0) return 100;
    return Math.max(0, ((totalPages - pagesRead) / totalPages) * 100);
  };

  return (
    <div className="min-h-screen bg-orange-700 text-brown-100">
      <NavBar></NavBar>
      {showPopup && (
        <GoalPopup userId={userId} onClose={() => setShowPopup(false)} />
      )}
      <div className="flex mt-20">
        {/* LEFT SIDE */}
        <div className="flex flex-col items-center w-1/4 pl-48">
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

          <div className="flex justify-center mt-4">
            {userId === auth.currentUser?.uid ? (
              <button
                className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
              >
                Share Profile
              </button>
            ) : isFollowing ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                >
                  Following ▼
                </button>
                {isDropdownOpen && (
                  <div className="absolute w-full text-center bg-white shadow-md p-2 rounded">
                    <button
                      onClick={handleFollowClick}
                      className="text-red-500"
                    >
                      Unfollow
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                onClick={handleFollowClick}
              >
                Follow
              </button>
            )}
          </div>

          <div>
            <h2 className="font-extrabold text-xl mt-8 mb-4 text-center">
              Following
            </h2>
            {followingDetails.length > 0 ? (
              <ul>
                {followingDetails.map((following) => (
                  <div
                    key={following.id}
                    className="text-gray-700 flex items-center space-x-3 p-2 relative"
                  >
                    <img
                      src={following.imageUrl || "/user.jpg"}
                      alt={following.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <button
                      onClick={() =>
                        setIsFollowingDropdownOpen((prev) =>
                          prev === following.id ? null : following.id
                        )
                      }
                      className="text-lg text-brown-100 font-medium"
                    >
                      {following.name}
                    </button>
                    {isFollowingDropdownOpen === following.id && (
                      <div className="absolute left-0 top-10 mt-1 z-10 w-full bg-white shadow-md rounded text-center">
                        <button
                          onClick={() => handleUnfollow(following.id)}
                          className="w-full py-2 font-medium text-red-500 hover:bg-orange-300 hover:text-white rounded-t"
                        >
                          Unfollow
                        </button>
                        <a
                          href={`/profile/${following.id}`}
                          className="block w-full py-2 font-medium text-brown-100 hover:bg-orange-300 hover:text-white rounded-b"
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">You are not following anyone.</p>
            )}
          </div>
          <div>
            <h2 className="font-extrabold text-xl mt-8 mb-4 text-center">
              Followers
            </h2>
            {followersDetails.length > 0 ? (
              <ul>
                {followersDetails.map((follower) => (
                  <a
                    href={`/profile/${follower.id}`}
                    key={follower.id}
                    className="text-gray-700 flex items-center space-x-3 p-2 relative"
                  >
                    <img
                      src={follower.imageUrl || "/user.jpg"}
                      alt={follower.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <p className="text-lg text-brown-100 font-medium">
                      {follower.name}
                    </p>
                  </a>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No followers yet.</p>
            )}
          </div>
        </div>

        {/* CENTER CONTENT */}
        <div className="flex flex-col w-2/5 pl-16 pr-28">
          {/* Personal Info */}
          <h1 className="text-3xl font-bold">{profileData.name}</h1>
          <hr className="w-full h-1 bg-brown-100 mb-5"></hr>
          <p>
            {profileData.city} {profileData.country}
          </p>
          <p className="mt-2">My goals: {profileData.goals}</p>
          <p className="mt-2">Favorite genres: {profileData.genres}</p>
          <p className="mt-2">{profileData.aboutMe}</p>

          {/* Hobbies */}
          <h3 className="font-semibold text-lg mt-4">Hobbies</h3>
          <p className="mt-2">
            {profileData.hobbies?.join(", ") || "Add your hobbies"}
          </p>

          {/* Favorites */}
          <div className="flex justify-between mt-10 items-center">
            <h3 className="font-semibold text-lg">Favorite Books</h3>
            <Link href="shelves/Read">See more</Link>
          </div>
          <hr className="w-full h-1 bg-brown-100 mb-5"></hr>
          <div className="flex gap-5 items-center justify-center">
            {favoriteBooks?.slice(0, 6).map((book) => (
              <div key={book.id} className="w-20 h-32 bg-gray-200">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )) || <p>No favorites yet.</p>}
          </div>

          {/* Recent Updates */}
          <h3 className="font-semibold text-lg mt-10">Recent Updates</h3>
          <hr className="w-full h-1 bg-brown-100 mb-5"></hr>
          <ul>
            {recentUpdates?.slice(0, 5).length > 0 ? (
              recentUpdates.slice(0, 5).map((update, index) => (
                <li key={index} className="flex items-start space-x-4 mb-4">
                  <img
                    src={update.image || "/default-cover.jpg"}
                    alt={`${update.title} cover`}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {update.title}
                    </p>
                    <p className="text-gray-600 text-sm">
                      by {update.authors?.join(", ") || "Unknown Author"}
                    </p>
                    {update.type === "Added" && (
                      <p className="text-gray-700 text-sm">
                        Book was added to shelf{" "}
                        <span className="font-medium">{update.shelfName}</span>.
                      </p>
                    )}
                    {update.type === "Rated" && (
                      <div className="text-gray-700 text-sm flex">
                        <p>Book was rated&nbsp;</p>
                        <div className="flex space-x-px">
                          {Array.from({ length: 5 }, (_, index) => (
                            <img
                              key={index}
                              src={`/stars${index < update.rating ? index + 1 : 0}.png`}
                              alt={`${index + 1} star`}
                              className="w-5 h-5"
                            />
                          ))}
                        </div>
                        <p>&nbsp;{update.rating === 1 ? "star" : "stars"}.</p>
                      </div>
                    )}
                    <p className="text-gray-500 text-xs">
                      Update on: {new Date(update.timestamp).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No recent updates.</p>
            )}
          </ul>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col w-1/3 pr-48">
          {/* Reading Challenge */}
          <div className="flex flex-col items-center w-full">
            <div className="bg-orange-300 flex py-5 gap-10 items-center w-full justify-center">
              <img src="/book.png" alt="Book" className="w-32" />
              <p className="text-brown-100 font-extrabold tracking-tighter text-3xl w-80">
                Challenge yourself this year!
              </p>
            </div>
            <div className="bg-brown-700 w-full flex items-center flex-col">
              <p>{profileData.name} has read</p>
              <p className="text-5xl font-bold">
                {" "}
                {readBooks.length} /{" "}
                {profileData.booksToRead?.[
                  new Date().getFullYear().toString()
                ] || 0}
              </p>
              <p>books this year</p>
            </div>

            <a
              className="rounded text-white text-center bg-orange-300 w-full py-4"
              href="/challenge"
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

export default ProfileScreen;
