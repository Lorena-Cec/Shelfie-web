import { db } from '@/lib/firebaseConfig';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

const createShelvesForUser = async (userId: string) => {
  const userDocRef = doc(db, 'users', userId);
  const shelvesCollectionRef = collection(userDocRef, 'shelves');
  const querySnapshot = await getDocs(shelvesCollectionRef);

  if (querySnapshot.empty) {
    await setDoc(doc(shelvesCollectionRef, 'Read'), {
      books: [],
    });
    await setDoc(doc(shelvesCollectionRef, 'Currently Reading'), {
      books: [],
    });
    await setDoc(doc(shelvesCollectionRef, 'To Read'), {
      books: [],
    });
    console.log('Shelves created for user:', userId);
  } else {
    console.log('Shelves already exist for user:', userId);
  }
};

export default createShelvesForUser;
