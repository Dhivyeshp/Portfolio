import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata = {
  title: "Dhivyesh Prithiviraj | Software Engineer",
  description: "Portfolio of Dhivyesh Prithiviraj, a software engineer building product, data, and ML-driven experiences."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plusJakarta.variable}`}>{children}</body>
    </html>
  );
}
