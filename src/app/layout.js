import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Memuat font Inter (Sans-Serif modern yang sangat bersih untuk teks biasa)
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

// Memuat font Playfair Display (Serif elegan untuk nama mempelai dan judul besar)
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap',
});

export const metadata = {
  title: "Undangan Pernikahan Digital",
  description: "Dibuat dengan Next.js dan Tailwind CSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      {/* Menggunakan Inter sebagai font bawaan seluruh halaman */}
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}