"use client"
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false }); // Prevent SSR (important for Plotly)

interface MyPlotProps {
  date: Date,
  balance: number
}

export default function MyPlot({
  in_data,
  start_date,
  end_date,
}: {
  in_data: MyPlotProps[];
  start_date: string;
  end_date: string;
}) {
  // Convert start and end dates to Date objects for comparison
  const start = new Date(start_date);
  const end = new Date(end_date);

  // Filter the data between start and end dates
  const filteredData = in_data.filter((d) => {
    const current = new Date(d.date);
    return current >= start && current <= end;
  });

  return (
    <Plot
      data={[
        {
          x: filteredData.map((d) => d.date),
          y: filteredData.map((d) => d.balance),
          type: "scatter",
          mode: "lines",
          line: { color: "#2563eb", width: 2 },
          fill: "tozeroy",
        },
      ]}
      layout={{
        autosize: true,
        margin: { l: 70, r: 20, t: 40, b: 40 },
        xaxis: {
          title: { text: "Date" },
          type: "date",
        },
        yaxis: {
          title: { text: "Value ($)" },
          tickformat: ",.2f",
        },
      }}
      config={{ responsive: true }}
      style={{ width: "100%", height: "300px" }}
    />
  );
}
