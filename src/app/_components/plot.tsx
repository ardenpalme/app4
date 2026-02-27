"use client"
import dynamic from "next/dynamic";
import { trpc } from "../_trpc/client"
import { format } from "@formkit/tempo";
import { PosSchema } from "@/schemas/portfolio";
import { PricesRespHist } from "@/lib/types";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false }); // Prevent SSR (important for Plotly)


export default function MyPlot({ data }: MyPlotProps) {
  return (
    <Plot
      data={[
        {
          x: data.map((d) => d.date),
          y: data.map((d) => d.value),
          type: "scatter",
          mode: "lines",
          line: { color: "#2563eb", width: 2 },
          fill: "tozeroy", // optional nice fill
        },
      ]}
      layout={{
        title: "Portfolio Value",
        autosize: true,
        margin: { l: 70, r: 20, t: 40, b: 40 },
        xaxis: {
          title: "Date",
          type: "date",
        },
        yaxis: {
          title: "Value ($)",
          tickformat: ",.2f",
        },
      }}
      config={{ responsive: true }}
      style={{ width: "100%", height: "300px" }}
    />
  );
}
