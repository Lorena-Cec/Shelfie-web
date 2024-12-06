import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  booksRead: number;
  readingGoal: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ booksRead, readingGoal }) => {
  const data = {
    labels: ["Books Read", "Reading goal"],
    datasets: [
      {
        label: "Books",
        data: [readingGoal, booksRead],
        backgroundColor: ["#F7D08Fff", "#D46536ff"],
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
    cutout: "70%",
  };

  return (
    <div className="w-1/5 mx-auto text-center">
      <p className="text-2xl font-bold py-10">Reading goal:</p>
      <div className="relative">
        <Doughnut data={data} options={options} />
        <p className="absolute inset-0 flex items-center justify-center text-6xl font-bold">
          {booksRead} / {readingGoal}
        </p>
      </div>
    </div>
  );
};

export default DonutChart;
