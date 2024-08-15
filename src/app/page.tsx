"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import HomeComponent from "./components/HomeComponent";

export default function Home() {
  const { publicKey } = useWallet();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-10">
      <div className="flex flex-col items-center justify-between p-10">
        <div className="flex flex-col gap-5 text-center">
          <div>
            <h1 className="text-2xl">Welcome to multi-sign</h1>
          </div>
          <div>
            <h1 className="text-lg">
              {publicKey
                ? "Create new multi-sign to get start"
                : "Please connect your base wallet to create or connect to multi-sign wallet"}
            </h1>
          </div>
          <div>
            <HomeComponent />
          </div>
        </div>
      </div>
    </main>
  );
}
