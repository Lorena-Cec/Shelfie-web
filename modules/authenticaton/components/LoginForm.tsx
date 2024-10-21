import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../lib/firebaseConfig';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';  
import { setUser } from '../state/authSlice';
import GoogleAuthButton from './GoogleAuthButton';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || "User", 
      };

      dispatch(setUser(userData));  
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email); 
      }
      toast.success(
        <div className="flex gap-4 items-center">
          <strong className="text-xs font-bold p-3">SUCCESS</strong>
          <div className="text-xs">Login successfull.</div>
        </div>,
         {
          closeButton: ({ closeToast }) => (
            <button className="custom-close-button" onClick={closeToast}>
              &#10006;
            </button>
          ),
        }
      );
      setTimeout(() => {
        router.push("/home");
      }, 1000);
    } catch (error) {
      toast.error(
        <div className="flex gap-4 items-center">
          <strong className="text-xs font-bold p-3">ERROR</strong>
          <div className="text-xs">Invalid email or password.</div>
        </div>,
         {
          closeButton: ({ closeToast }) => (
            <button className="custom-close-button" onClick={closeToast}>
              &#10006;
            </button>
          ),
        }
      );
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Error sending password reset email', error);
      toast.error('Error sending password reset email');
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if(rememberedEmail){
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="max-h-screen bg-yellow-200 flex flex-col ">
        <div className="flex justify-between gap-10 items-center">
            <div className="flex flex-col items-center w-3/5 p-10">
                <h1 className='text-4xl text-center mb-28 -mt-20 text-brown-100 font-extrabold tracking-tighter'>Shelfie</h1>
                <h2 className="text-2xl text-brown-100 font-bold mb-4 text-center">Sign into your account</h2>
                <form onSubmit={handleLogin} className="space-y-3 w-80">
                    <p className="text-sm text-brown-100 text-center">
                        Don't have an account?{" "}
                        <button
                        type="button"
                        onClick={() => router.push('register')}
                        className="text-brown-100 underline mb-4"
                        >Register
                        </button>
                    </p>
                    <p className='text-brown-100 text-xs'>EMAIL</p>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                    <p className='text-brown-100 text-xs'>PASSWORD</p>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />

                    <div className="flex items-center mb-4">
                        <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="mr-2"
                        />
                        <label htmlFor="rememberMe" className="text-sm text-brown-100">Remember Me</label>
                    </div>

                    <button type="submit" className="w-full bg-orange-100 text-white py-2 rounded-md hover:bg-blue-600">
                        Login
                    </button>
                    <p className='text-brown-100 text-xs text-center'>or</p>
                    <GoogleAuthButton isLogin={true} />
                    <p className="text-sm text-brown-100">
                        Forgot{" "} 
                        <button 
                        type="button" 
                        onClick={handleForgotPassword} 
                        className="text-brown-100 underline mt-2"
                        >
                        Password?
                        </button>
                    </p>
                </form>
                <ToastContainer position='top-center' className="whitespace-nowrap" autoClose={3000} hideProgressBar />
            </div>
            <div className='overflow-hidden'>
                <img src="../bg1.png" alt="Background image" className='h-screen w-full object-cover'/>
            </div>
        </div>
    </div>
  );
};

export default LoginForm;