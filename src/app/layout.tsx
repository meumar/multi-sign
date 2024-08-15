"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Topbar from "./components/Layout/Topbar";
import { WalletContextProvider } from "./components/WalletContextProvider";


// import 'bootstrap/dist/css/bootstrap.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <div>
            <ToastContainer />
            <Topbar />
            {children}
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
