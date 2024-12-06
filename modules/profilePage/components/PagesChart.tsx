import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PagesChartProps {
  pagesRead: number;
}

const PagesChart: React.FC<PagesChartProps> = ({ pagesRead }) => {
  const data = {
    labels: [],
    datasets: [
      {
        data: [1],
        backgroundColor: ["#F7D08Fff"],
        borderWidth: 0,
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
        enabled: false,
      },
    },
    cutout: "0%",
  };

  return (
    <div className="w-1/5 mx-auto text-center">
      <p className="text-2xl font-bold py-10">Total pages read:</p>
      <div className="relative">
        <Doughnut data={data} options={options} />
        <p className="absolute inset-0 flex items-center justify-center text-6xl font-bold">
          {pagesRead}
        </p>
      </div>
    </div>
  );
};

export default PagesChart;
