import Image from "next/image";
import localFont from "next/font/local";
import { useRouter } from "next/router";
import { useEffect } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/home'); 
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary-700">
      <h1 className="text-4xl font-bold open-sans text-primary-100 mb-4 tracking-tighter">
        Welcome to Shelfie!
      </h1>
      <p className="text-lg text-primary-400">
        Find and organize your favorite books in one place.
      </p>
    </div>
  );
}
