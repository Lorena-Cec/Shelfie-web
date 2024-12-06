/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChallengeScreenProps {
  readBooks: Array<any>;
}

const RatingPieChart: React.FC<ChallengeScreenProps> = ({ readBooks }) => {
  // Broj knjiga za svaku ocenu
  const [ratingData, setRatingData] = useState([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    // Funkcija za računanje distribucije ocjena
    const ratingsCount = [0, 0, 0, 0, 0, 0]; // Za 0, 1, 2, 3, 4, 5 ocjena
    readBooks.forEach((book) => {
      const rating = book.rating; // Pretpostavljamo da je rating broj između 0 i 5
      if (rating === undefined) {
        ratingsCount[0] += 1; // Ako nema ratinga, ide u 0
      } else {
        ratingsCount[rating] += 1; // Ako ima rating, inkrementiraj odgovarajući broj
      }
    });

    setRatingData(ratingsCount);
  }, [readBooks]);

  const data = {
    labels: ["No Rating", "1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [
      {
        label: "Book Ratings",
        data: ratingData, // Ovo je niz sa brojem knjiga po ratingu
        backgroundColor: [
          "#D3D3D3",
          "#FFCC00",
          "#FF8000",
          "#FF4C00",
          "#D32F2F",
          "#C2185B",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        enabled: true,
      },
    },
    cutout: "70%",
  };

  return (
    <div className="w-1/4 mx-auto">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default RatingPieChart;
