/* eslint-disable @typescript-eslint/no-explicit-any */
import NavBar from "@/components/NavBar";
import { auth, db } from "@/lib/firebaseConfig";
import { ProfileData, useFirestore } from "@/modules/profilePage";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";

const FeedScreen = () => {
  const { getProfileData, unfollowUser } = useFirestore();

  const [feedUpdates, setFeedUpdates] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowingDropdownOpen, setIsFollowingDropdownOpen] = useState(false);
  const [, setIsFollowing] = useState(false);

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
    const fetchData = async () => {
      if (!currentUserId) return;
      const data = await getProfileData(currentUserId);
      if (data) {
        setProfileData(data);
      }
    };

    fetchData();
  }, [currentUserId]);

  const fetchFeedUpdates = async () => {
    if (!profileData.following || profileData.following.length === 0) {
      console.log("No followers to fetch updates for.");
      return;
    }

    const followingPromises = profileData.following.map(
      async (followingId: string) => {
        const followingRef = doc(db, "users", followingId);
        const followingSnap = await getDoc(followingRef);

        if (followingSnap.exists()) {
          const shelvesRef = collection(db, "users", followingId, "shelves");
          const shelvesSnap = await getDocs(shelvesRef);

          const userUpdates: any[] = [];

          const shelfPromises = shelvesSnap.docs.map(async (shelfDoc) => {
            const shelfData = shelfDoc.data();
            const books = shelfData.books || [];
            const shelfName = shelfDoc.id;

            const bookPromises = books.map(async (book: any) => {
              let updateData = {
                authorId: followingId,
                id: book.id,
                title: book.title,
                type: "",
                timestamp: 0,
                author: book.authors?.join(", ") || "Unknown",
                imageUrl: book.image,
                rating: book.rating,
                shelfName,
                description: "",
              };

              if (book.recentAdd) {
                updateData = {
                  ...updateData,
                  type: "Added",
                  timestamp: book.recentAdd,
                };
              }
              if (book.recentRating) {
                updateData = {
                  ...updateData,
                  type: "Rated",
                  timestamp: book.recentRating,
                };
              }

              return updateData;
            });

            return await Promise.all(bookPromises);
          });

          const allShelfUpdates = await Promise.all(shelfPromises);
          userUpdates.push(...allShelfUpdates.flat());

          return userUpdates;
        }
        return [];
      }
    );

    const allUpdates = await Promise.all(followingPromises);

    const flattenedUpdates = allUpdates.flat();

    const sortedUpdates = flattenedUpdates.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const latestUpdates = sortedUpdates.slice(0, 10);

    const bookDetailsPromises = latestUpdates.map(async (update) => {
      const description = await fetchBookDescription(update.id);
      return {
        ...update,
        description: description,
      };
    });

    const finalUpdates = await Promise.all(bookDetailsPromises);

    setFeedUpdates(finalUpdates);
  };

  const fetchBookDescription = async (bookId: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${bookId}`
      );
      const data = await response.json();
      return data.volumeInfo?.description || "No description available.";
    } catch (error) {
      console.error("Error fetching book description:", error);
      return "No description available.";
    }
  };

  const handleUnfollow = async (id: string) => {
    if (!currentUserId) return;
    await unfollowUser(currentUserId, id);
    const data = await getProfileData(currentUserId);
    if (data) {
      setProfileData(data);
      setIsFollowing(data.following?.includes(currentUserId) || false);
    }
  };

  useEffect(() => {
    if (profileData?.following?.length) {
      fetchFeedUpdates();
    }
  }, [profileData?.following]);

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

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex bg-brown-700 p-20">
        <div className="flex gap-44 justify-center">
          <div className="flex flex-col items-center w-1/4">
            <div>
              <h2 className="font-extrabold text-2xl mt-8 mb-4 text-center text-brown-100">
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
                        className="w-8 h-8 rounded-full object-cover absolute top-0 -left-10"
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
          </div>

          {feedUpdates.length > 0 ? (
            <ul className="w-2/3">
              {feedUpdates.map((update, index) => {
                const following = followingDetails.find(
                  (f) => f.id === update.authorId
                );

                return (
                  <li
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md mb-4 flex space-x-4 items-center relative"
                  >
                    {/* Profilna slika following osobe */}
                    <img
                      src={following.imageUrl || "/user.jpg"}
                      alt={`${following?.name} profile`}
                      className="w-12 h-12 rounded-full object-cover absolute top-0 -left-10"
                    />

                    <div className="flex-1">
                      {/* Ime following osobe */}
                      <div className="flex">
                        <p className="font-semibold text-gray-900">
                          {following?.name}&nbsp;
                        </p>

                        {/* Prikaz aktivnosti */}
                        <p className="text-gray-900">
                          {update.type === "Rated" && (
                            <span className="font-bold">rated</span>
                          )}
                          {update.shelfName === "Read" &&
                            update.type === "Added" && (
                              <span className="font-semibold text-gray-900">
                                read
                              </span>
                            )}
                          {update.shelfName === "Currently Reading" &&
                            update.type === "Added" && (
                              <span className="font-semibold text-gray-900">
                                is currently reading
                              </span>
                            )}
                          {update.shelfName === "To Read" &&
                            update.type === "Added" && (
                              <span className="font-semibold text-gray-900">
                                wants to Read
                              </span>
                            )}
                        </p>
                      </div>

                      {/* Prikaz knjige */}
                      <div className="mt-2 flex items-center">
                        <img
                          src={update.imageUrl || "/default-book-image.jpg"}
                          alt={update.title}
                          className="w-40 h-64 object-cover rounded-md"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-semibold text-2xl text-gray-800">
                            {update.title}
                          </p>
                          <p className="text-xl text-gray-600">
                            {update.author}
                          </p>

                          {/* Prikaz opisa knjige */}
                          {update.description && (
                            <p className="text-lg text-gray-500 mt-2">
                              {update.description.slice(0, 150)} ...
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Prikaz zvjezdica za ocjenu */}
                      {update.type === "Rated" && update.rating && (
                        <div className="mt-2">
                          <p className="text-yellow-500">
                            {"★".repeat(update.rating)}
                          </p>
                        </div>
                      )}

                      {/* Prikaz vremena */}
                      <p className="text-sm text-gray-400 mt-2">
                        {new Date(update.timestamp).toLocaleDateString()} at{" "}
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">
              No updates from people you are following yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedScreen;
