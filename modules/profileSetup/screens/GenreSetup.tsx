import React, { useState } from 'react';
import NavNewUser from '@/modules/profileSetup/components/NavNewUser';
import { useRouter } from 'next/router';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig'; 


const ChallengeSetup: React.FC = () => {
    const [goals, setGoals] = useState<string[]>([]);
    const [otherGoal, setOtherGoal] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false); 
    
    const router = useRouter();
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const allgoals = [
      "Read more classics",
      "Try reading horrors/thrillers",
      "Write more",
      "Try bookbinding",
      "Draw manga",
      "Try audiobooks",
      "Other"
    ];
  
    const toggleGoal = (goal: string) => {
      if (goals.includes(goal)) {
        setGoals(goals.filter(h => h !== goal)); 
      } else {
        setGoals([...goals, goal]); 
      }
    };

    const sendInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const user = auth.currentUser; 
        if (user) {
        const finalGoals = isOtherSelected && otherGoal ? [...goals.filter(h => h !== "Other"), otherGoal] : goals;
        await setDoc(doc(db, 'users', user.uid), {
            ProfileInfo: {  
            goals: finalGoals,
            },
        }, { merge: true }); 
        }
    };


  return (
    <div className="flex flex-col h-screen">
      <NavNewUser currentPage = {3}/>
      <div className="flex flex-col items-center bg-orange-700">
        <div className="flex flex-col gap-3 items-start mt-20 mb-5 w-0.3">
            <p className='text-brown-100 open-sans text-2xl'>
                Set a Reading Goal
            </p>
            <p className='text-brown-200 font-thin'>
                Join the 2024 reading challenge! Tell us how many books you want to read this year and we will keep you on track.
            </p>
        </div>
        
        <form onSubmit={sendInfo} className="space-y-3 w-0.3 bg-white border border-orange-400 rounded-lg mb-10">
            <div className='bg-orange-300 flex py-5 gap-10 items-center justify-center'>
                <img src="/wallpaper.png" alt="Book" className='w-32'/>
                <p className='text-brown-100 font-extrabold tracking-tighter text-4xl w-80'>Challenge yourself this year!</p>
            </div>
            <div className='flex flex-col px-10 py-5 items-center'>
                <p className='text-brown-300 mb-5'>How many books do you want to read this year?</p>
                <div className='w-full'>
                    <input type="range" min="1" max="100" value="10" className='w-full h-6 bg-orange-300'/>
                </div>
                <p className='text-brown-300 mb-5 mt-10'>What other reading goals do you want to set for this year?</p>


                <div className='w-full mb-5'>

                <div className="relative">
                    <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400 text-left"
                    >
                    {goals.length > 0 ? goals.join(', ') : 'Select goals'}
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute bg-white border border-gray-300 mt-1 w-full z-10">
                            {allgoals.map((goal) => (
                            <div key={goal} className="flex items-center p-2 hover:bg-orange-100 cursor-pointer">
                                <input 
                                type="checkbox" 
                                checked={goals.includes(goal)} 
                                onChange={() => toggleGoal(goal)} 
                                className="mr-2"
                                />
                                <label className='text-brown-100 '>{goal}</label>
                            </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {goals.includes("Other") && (
                    <input
                    type="text"
                    placeholder="Other goal"
                    onChange={(e) => setOtherGoal(e.target.value)}
                    className="w-full text-brown-100 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400 mt-2"
                    />
                )}
                </div>
            
                <button type="submit" className="w-full bg-orange-100 text-white py-2 rounded-md hover:bg-blue-600">
                    Save Reading Goals
                </button> 
            </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeSetup;
