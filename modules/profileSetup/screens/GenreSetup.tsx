import React, { useEffect, useState } from "react";
import NavNewUser from "@/modules/profileSetup/components/NavNewUser";
import { useRouter } from "next/router";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GenreSelect: React.FC = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const router = useRouter();

  const allGenres = [
    "Fantasy",
    "Science Fiction",
    "Dystopian",
    "Action",
    "Adventure",
    "Mystery",
    "Thriller",
    "Romance",
    "Horror",
    "Historical Fiction",
    "Children’s Fiction",
    "Women’s Fiction",
    "Contemporary Fiction",
    "Literary Fiction",
    "Manga",
    "Autobiography",
    "Biography",
    "History",
    "Food & Drink",
    "Poetry",
    "Self-Help",
    "True Crime",
    "Travel",
    "Art",
    "Photography",
    "Essays",
    "Social Sciences",
    "Science & Technology",
  ].sort();

  useEffect(() => {
    console.log(genres);
  });

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  };

  const sendInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (genres.length === 0) {
      toast.error("You must select at least one genre!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const user = auth.currentUser;
    if (user) {
      await setDoc(
        doc(db, "users", user.uid),
        {
          ProfileInfo: {
            genres: genres,
          },
        },
        { merge: true }
      );
      router.push("/home");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-orange-700">
      <NavNewUser currentPage={3} />
      <div className="flex flex-col items-center align-middle">
        <div className="flex flex-col gap-3 items-start mt-20 mb-5 w-0.3">
          <p className="text-brown-100 open-sans text-2xl">Select genres</p>
          <p className="text-brown-200 font-thin">
            Which genres make you feel excited? Tell us what you like and we
            will adjust your recommendations based on what you select.
          </p>
        </div>

        <form
          onSubmit={sendInfo}
          className="space-y-3 w-0.3 bg-white border border-orange-400 rounded-lg mb-10"
        >
          <div className="flex flex-col px-10 py-5 items-center">
            <p className="text-brown-300 mb-5 mt-5">
              What genres do you like to read?
            </p>

            <p className="text-sm text-brown-400">Select at least one genre</p>

            <div className="w-full mb-5">
              <div className="bg-white border border-gray-300 mt-1 w-full z-10 flex flex-wrap justify-between gap-2">
                {allGenres.map((genre) => (
                  <div
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`flex items-center p-2 cursor-pointer rounded-lg ${
                      genres.includes(genre)
                        ? "bg-orange-200"
                        : "hover:bg-orange-400"
                    }`}
                  >
                    <p
                      className={`text-brown-100 whitespace-nowrap ${genres.includes(genre) ? "text-white" : ""}`}
                    >
                      {genre}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-orange-100 text-white py-2 rounded-md hover:bg-orange-200"
            >
              Save Genres
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default GenreSelect;
