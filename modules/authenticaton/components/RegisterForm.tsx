import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, db } from '../../../lib/firebaseConfig';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setUser } from '../state/authSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GoogleAuthButton from './GoogleAuthButton';
import { doc, setDoc } from 'firebase/firestore';
import createShelvesForUser from '@/hooks/createShelvesForUser';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  const [rememberMe, setRememberMe] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || 'User',
      };

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
      });

      await createShelvesForUser(user.uid);

      dispatch(setUser(userData)); //firebase persistence auth
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      }
      await sendEmailVerification(user);
      router.push('/auth/verification');
    } catch (error) {
      toast.error('Error during registration. Please try again.');
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-yellow-200 flex flex-col ">
      <div className="flex justify-between gap-10 items-center">
        <div className="flex flex-col items-center w-3/5 p-10">
          <h1 className="text-4xl text-center mb-28 -mt-20 text-brown-100 font-extrabold tracking-tighter">
            Shelfie
          </h1>
          <h2 className="text-2xl text-brown-100 font-bold mb-4 text-center">
            Create new Account
          </h2>
          <p className="text-sm text-brown-100 text-center mb-6">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('login')}
              className="text-brown-100 underline"
            >
              Login here
            </button>
          </p>
          <form onSubmit={handleRegister} className="space-y-3 w-80">
            <p className="text-brown-100 text-xs">NAME</p>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-brown-100 w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            <p className="text-brown-100 text-xs">EMAIL</p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-brown-100 w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            <p className="text-brown-100 text-xs">PASSWORD</p>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-brown-100 w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="float-end mb-4">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-400">
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-100 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Register
            </button>
            <p className="text-brown-100 text-xs text-center">or</p>
            <GoogleAuthButton isLogin={false} />
          </form>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar
          />
        </div>
        <div className="overflow-hidden">
          <img
            src="../bg1.png"
            alt="Background image"
            className="h-screen w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
