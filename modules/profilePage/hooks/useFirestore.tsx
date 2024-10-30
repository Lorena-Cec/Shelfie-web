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

      const profileInfo = data.ProfileInfo || {};

      return {
        imageUrl: profileInfo.imageUrl || "",
        name: data.name || "",
        city: profileInfo.city || "",
        country: profileInfo.country || "",
        aboutMe: profileInfo.aboutMe || "",
        hobbies: profileInfo.hobbies || [],
        booksToRead: profileInfo.booksToRead || 0,
        friends: profileInfo.friends || [],
        favoriteBooks: profileInfo.favoriteBooks || [],
        recentUpdates: profileInfo.recentUpdates || [],
        currentlyReading: profileInfo.currentlyReading || [],
        recentlyRead: profileInfo.recentlyRead || [],
      };
    }

    return null;
  };

  const updateProfileImage = async (userId: string, file: File) => {
    const storageRef = ref(storage, `profileImages/${userId}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const addFriend = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    const data = await getProfileData(userId);
    if (data && data.friends) {
      await updateDoc(userRef, { friends: [...data.friends, userId] });
    } else {
      await updateDoc(userRef, { friends: [userId] });
    }
  };

  const removeFriend = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    const data = await getProfileData(userId);
    if (data && data.friends) {
      await updateDoc(userRef, {
        friends: data.friends.filter((id: string) => id !== userId),
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
    addFriend,
    removeFriend,
    sendInfo,
    getReadBooksThisYear,
  };
};
