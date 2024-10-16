import React, { useEffect, useState } from "react";
import { sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import { useRouter } from "next/router";
import { toast } from "react-toastify"; 
import 'react-toastify/dist/ReactToastify.css';

const VerifyPage = () => {
  const [isSending, setIsSending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null); 
  const router = useRouter();

  const handleResendEmail = async () => {
    setIsSending(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success("Verification email sent. Please check your inbox.");
      } else {
        toast.error("Error: User not found.");
      }
    } catch (error) {
      toast.error("Error sending verification email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const checkIfVerified = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload(); 
      if (auth.currentUser.emailVerified) {
        toast.success("Your email has been verified!");
        router.push("/profileSetup"); 
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email); 
        checkIfVerified(); 
      } else {
        setUserEmail(null);
      }
    });

    return () => unsubscribe(); 
  }, []);


  const handleVerifyLater = () => {
    router.push("/");
  };

  return (
    <div className="bg-book-pattern bg-cover bg-center min-h-screen flex justify-center items-center">
      <div className="bg-orange-300 w-96 p-6 rounded-lg shadow-lg">
        <h1 className='text-4xl text-center mb-6 text-brown-100 font-extrabold tracking-tighter'>
          Shelfie
        </h1>
        <h2 className="text-2xl text-brown-100 font-bold mb-4 text-center">
          Verify your email address
        </h2>
        <p className="text-brown-100 text-center mb-4">
          {userEmail ? `We have sent an email to ${userEmail}. Follow the link in the mail to verify your address.` : "Loading..."}
        </p>

        <button 
          className={`bg-orange-100 text-white font-bold py-2 px-4 rounded w-full transition-colors mb-4 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleResendEmail}
          disabled={isSending} 
        >
          {isSending ? "Sending..." : "Resend email"}
        </button>

        <button className="text-orange-100 hover:underline text-center w-full" onClick={handleVerifyLater}>
          Verify later
        </button>
      </div>
    </div>
  );
};

export default VerifyPage;
