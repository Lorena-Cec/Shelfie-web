import { getDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export const getBooksToReadForYear = async (userId: string, year: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log("User not found");
      return null;
    }

    const userData = userDoc.data();
    const profileInfo = userData.ProfileInfo || {}; // Dohvati ProfileInfo
    const booksToRead = profileInfo.booksToRead || {}; // Dohvati booksToRead unutar ProfileInfo
    console.log("Books to read data:", booksToRead);
    console.log("Books to read data for the year:", booksToRead[year]);

    return booksToRead[year] || null;
  } catch (error) {
    console.error("Error fetching booksToRead:", error);
    return null;
  }
};

export const setBooksToReadForYear = async (
  userId: string,
  year: string,
  target: number
) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const profileInfo = userData.ProfileInfo || {}; // Dohvati ProfileInfo ako postoji
      const booksToRead = profileInfo.booksToRead || {}; // Ako `booksToRead` ne postoji, koristi prazan objekt

      // Postavi ili ažuriraj broj knjiga za tu godinu
      booksToRead[year] = target;

      // Ažuriraj ProfileInfo s novim booksToRead
      await updateDoc(userDocRef, {
        "ProfileInfo.booksToRead": booksToRead, // Ažuriraj samo dio u ProfileInfo
      });
    } else {
      // Ako dokument korisnika ne postoji, kreiraj ga s novim ProfileInfo
      await setDoc(userDocRef, {
        ProfileInfo: {
          booksToRead: { [year]: target },
        },
      });
    }

    console.log(`Books to read for ${year} set to ${target}`);
  } catch (error) {
    console.error("Error setting booksToRead:", error);
  }
};
