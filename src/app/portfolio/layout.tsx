import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Quantitative investment strategy and current portfolio holdings.",
};

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
    </div>
  );
}
