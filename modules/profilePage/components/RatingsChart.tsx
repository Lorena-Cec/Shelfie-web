/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChallengeScreenProps {
  readBooks: Array<any>;
}

const RatingPieChart: React.FC<ChallengeScreenProps> = ({ readBooks }) => {
  const [ratingData, setRatingData] = useState([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const ratingsCount = [0, 0, 0, 0, 0, 0];
    readBooks.forEach((book) => {
      const rating = book.rating;
      if (rating === undefined) {
        ratingsCount[0] += 1;
      } else {
        ratingsCount[rating] += 1;
      }
    });

    setRatingData(ratingsCount);
  }, [readBooks]);

  const data = {
    labels: ["No Rating", "1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [
      {
        label: "Book Ratings",
        data: ratingData,
        backgroundColor: [
          "#72260Bff",
          "#A14524ff",
          "#D46536ff",
          "#DF8739ff",
          "#E9A73Bff",
          "#FFCA72ff",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    cutout: "0%",
  };

  return (
    <div className="w-1/5 mx-auto text-center">
      <p className="text-2xl font-bold py-10">Ratings:</p>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default RatingPieChart;
