import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBu_UkZ7LNFRS-4cYkcQeLVxd0hQjjFPVM",
  authDomain: "shelfie-web.firebaseapp.com",
  projectId: "shelfie-web",
  storageBucket: "shelfie-web.appspot.com",
  messagingSenderId: "977962160083",
  appId: "1:977962160083:web:21dca2d1647edfa8e46926"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app); 

export { auth, googleProvider, db };