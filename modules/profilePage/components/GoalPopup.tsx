import { useState } from "react";
import { setBooksToReadForYear } from "../hooks/setReadingGoal";
import React from "react";

export const GoalPopup: React.FC<{
  userId: string;
  onClose: () => void;
}> = ({ userId, onClose }) => {
  const [goal, setGoal] = useState<number>(0);

  const handleSave = async () => {
    const currentYear = new Date().getFullYear().toString();
    await setBooksToReadForYear(userId, currentYear, goal);
    onClose();
  };

  const getTrackBackground = (value: number) => {
    const percentage = ((value - 1) / (100 - 1)) * 100;
    return `linear-gradient(to right, #D46536ff 0%, #D46536ff ${percentage}%, #CEA17Dff ${percentage}%, #CEA17Dff 100%)`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg text-center">
        <div className="bg-orange-300 flex py-5 gap-5 items-center justify-center rounded-t-md">
          <img src="/book.png" alt="Book" className="w-32 pl-5" />
        </div>
        <div className="flex flex-col px-10 py-5 items-center ">
          <div className="w-fit">
            <p className="text-brown-200  font-bold">
              How many books do you want to read this year?
            </p>
            <div className="w-full h-0.5 bg-brown-400 mb-5"></div>
          </div>

          <div className="w-full ">
            <input
              type="range"
              min="1"
              max="100"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="w-full"
              style={{ background: getTrackBackground(goal) }}
            />
            <p className="text-brown-300 text-center my-4">
              You will read <span className="font-bold">{goal}</span> books this
              year!
            </p>
            <button
              onClick={handleSave}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              Save Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
