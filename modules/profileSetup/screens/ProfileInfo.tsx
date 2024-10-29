import React, { useState } from "react";
import NavNewUser from "@/modules/profileSetup/components/NavNewUser";
import { useRouter } from "next/router";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";

const ProfileSetup: React.FC = () => {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [favoriteBook, setFavoriteBook] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [otherHobby, setOtherHobby] = useState("");
  const [isOtherSelected] = useState(false);

  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const allHobbies = [
    "Bookbinding",
    "Drawing",
    "Writing",
    "Painting",
    "Photography",
    "Videography",
    "Other",
  ];

  const toggleHobby = (hobby: string) => {
    if (hobbies.includes(hobby)) {
      setHobbies(hobbies.filter((h) => h !== hobby));
    } else {
      setHobbies([...hobbies, hobby]);
    }
  };

  const sendInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (user) {
      const finalHobbies =
        isOtherSelected && otherHobby
          ? [...hobbies.filter((h) => h !== "Other"), otherHobby]
          : hobbies;

      await setDoc(
        doc(db, "users", user.uid),
        {
          ProfileInfo: {
            city,
            country,
            favoriteBook,
            aboutMe,
            hobbies: finalHobbies,
          },
        },
        { merge: true }
      );
      console.log("Profile info saved successfully.");
      router.push("/setup/goalsSetup");
    }
  };

  return (
    <div className="flex flex-col h-full bg-orange-700">
      <NavNewUser currentPage={1} />
      <div className="flex flex-col items-center">
        <div className="flex flex-col gap-3 items-start mt-20 mb-5 w-0.3">
          <p className="text-brown-100 open-sans text-2xl">
            Setup your profile
          </p>
          <p className="text-brown-200 font-thin">
            Tell people a little about yourself, where you are from and what
            interests you have. This will be seen on your profile page so people
            can get to know you.
          </p>
        </div>

        <form
          onSubmit={sendInfo}
          className="space-y-3 w-0.3 bg-white border border-orange-400 rounded-lg px-20 py-10"
        >
          <p className="text-brown-100 text-xs">CITY</p>
          <input
            type="text"
            placeholder="Paris"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />

          <p className="text-brown-100 text-xs">COUNTRY</p>
          <input
            type="text"
            placeholder="France"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />

          <p className="text-brown-100 text-xs">FAVORITE BOOK</p>
          <input
            type="text"
            placeholder="Favorite Book"
            value={favoriteBook}
            onChange={(e) => setFavoriteBook(e.target.value)}
            className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />

          <p className="text-brown-100 text-xs">ABOUT ME</p>
          <textarea
            placeholder="Tell us about yourself..."
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />

          <div className="">
            <p className="text-brown-100 text-xs">HOBBIES</p>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400 text-left"
              >
                {hobbies.length > 0 ? hobbies.join(", ") : "Select hobbies"}
              </button>

              {isDropdownOpen && (
                <div className="absolute bg-white border border-gray-300 mt-1 w-full z-10">
                  {allHobbies.map((hobby) => (
                    <div
                      key={hobby}
                      className="flex items-center p-2 hover:bg-orange-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={hobbies.includes(hobby)}
                        onChange={() => toggleHobby(hobby)}
                        className="mr-2"
                      />
                      <label className="text-brown-100 ">{hobby}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hobbies.includes("Other") && (
              <input
                type="text"
                placeholder="Other hobby"
                onChange={(e) => setOtherHobby(e.target.value)}
                className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400 mt-2"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-orange-300 text-white py-2 mt-5 rounded-md hover:bg-blue-600"
          >
            Save Profile Settings
          </button>
        </form>
        <p className="p-10">Skip for now</p>
      </div>
    </div>
  );
};

export default ProfileSetup;
