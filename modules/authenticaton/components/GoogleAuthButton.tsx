import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { googleProvider, auth } from '../../../lib/firebaseConfig';
import { useRouter } from 'next/router';

interface GoogleAuthButtonProps {
  isLogin: boolean; 
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ isLogin }) => {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/home');
    } catch (error) {
      console.error('Error with Google login', error);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full bg-blue-400 text-white py-2 rounded-md hover:bg-red-600 mt-4"
    >
      {isLogin ? 'Sign in with Google' : 'Sign up with Google'} 
    </button>
  );
};

export default GoogleAuthButton;