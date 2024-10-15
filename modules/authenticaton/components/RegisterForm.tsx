import React, { useEffect } from 'react';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../lib/firebaseConfig';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';  
import { setUser } from '../state/authSlice'; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import GoogleAuthButton from './GoogleAuthButton';
import { doc, setDoc } from 'firebase/firestore';

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || "User", 
      };

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
      });

      dispatch(setUser(userData)); //firebase persistence auth
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email); 
      }
      router.push('/home');
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
        <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mt-[-50px]">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-400">Remember Me</label>
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
            Register
          </button>
          <GoogleAuthButton isLogin={false} />
          <p className="text-sm text-gray-400">
            Already have an account?{" "} 
            <button
            type="button"
            onClick={() => router.push('login')}
            className="text-blue-500 underline"
            >Login here
            </button>
          </p>
        </form>
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      </div>
    </div>
    </div>
  );
};

export default RegisterForm;