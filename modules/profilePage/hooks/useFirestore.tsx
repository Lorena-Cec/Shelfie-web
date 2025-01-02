/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth, db, storage } from "@/lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ProfileData } from "../models/ProfileData";

export const useFirestore = () => {
  const getProfileData = async (
    userId: string
  ): Promise<ProfileData | null> => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      const profileInfo = data.ProfileInfo || {}; // Podaci unutar ProfileInfo
      const followers = data.followers || []; // Direktno iz dokumenta korisnika, izvan ProfileInfo
      const following = data.following || [];

      return {
        imageUrl: profileInfo.imageUrl || "",
        name: data.name || "",
        city: profileInfo.city || "",
        country: profileInfo.country || "",
        aboutMe: profileInfo.aboutMe || "",
        hobbies: profileInfo.hobbies || [],
        booksToRead: profileInfo.booksToRead || 0,
        goals: profileInfo.goals || "",
        genres: profileInfo.genres || "",
        favoriteBooks: profileInfo.favoriteBooks || [],
        recentUpdates: profileInfo.recentUpdates || [],
        currentlyReading: profileInfo.currentlyReading || [],
        recentlyRead: profileInfo.recentlyRead || [],
        followers: followers, // Dodajemo following izvan ProfileInfo
        following: following,
      };
    }

    return null;
  };

  const updateProfileImage = async (userId: string, file: File) => {
    const storageRef = ref(storage, `profileImages/${userId}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const addFollow = async (currentUserId: string, otherUserId: string) => {
    const currentUserRef = doc(db, "users", currentUserId);
    const otherUserRef = doc(db, "users", otherUserId);

    const currentUserData = await getProfileData(currentUserId);
    const otherUserData = await getProfileData(otherUserId);

    if (
      currentUserData &&
      currentUserData.following &&
      !currentUserData.following.includes(otherUserId)
    ) {
      await updateDoc(currentUserRef, {
        following: [...currentUserData.following, otherUserId],
      });
    }

    if (
      otherUserData &&
      otherUserData.followers &&
      !otherUserData.followers.includes(currentUserId)
    ) {
      await updateDoc(otherUserRef, {
        followers: [...otherUserData.followers, currentUserId],
      });
    }
  };

  const unfollowUser = async (currentUserId: string, otherUserId: string) => {
    const currentUserRef = doc(db, "users", currentUserId);
    const otherUserRef = doc(db, "users", otherUserId);

    const currentUserData = await getProfileData(currentUserId);
    const otherUserData = await getProfileData(otherUserId);

    // Uklanjanje iz 'following' liste trenutnog korisnika
    if (currentUserData && currentUserData.following) {
      await updateDoc(currentUserRef, {
        following: currentUserData.following.filter((id) => id !== otherUserId),
      });
    }

    // Uklanjanje iz 'followers' liste drugog korisnika
    if (otherUserData && otherUserData.followers) {
      await updateDoc(otherUserRef, {
        followers: otherUserData.followers.filter((id) => id !== currentUserId),
      });
    }
  };

  const sendInfo = async (imageUrl: string) => {
    const user = auth.currentUser;
    if (user) {
      await setDoc(
        doc(db, "users", user.uid),
        {
          ProfileInfo: {
            imageUrl,
          },
        },
        { merge: true }
      );
      console.log("Profile info saved successfully.");
    }
  };

  const getReadBooksThisYear = async (userId: string) => {
    const shelvesRef = doc(db, "users", userId, "shelves", "Read");
    const docSnap = await getDoc(shelvesRef);

    if (!docSnap.exists()) {
      console.log("No such document!");
      return [];
    }

    const data = docSnap.data();
    const books = data.books || [];

    const currentYear = new Date().getFullYear();

    const readBooksThisYear = books.filter(
      (book: { readDate: { toDate: () => any }; title: any }) => {
        if (!book.readDate) {
          return false;
        }
        const readDate = book.readDate.toDate();
        return readDate.getFullYear() === currentYear;
      }
    );
    return readBooksThisYear;
  };

  return {
    getProfileData,
    updateProfileImage,
    addFollow,
    unfollowUser,
    sendInfo,
    getReadBooksThisYear,
  };
};
