"use client";
import type { NextPage } from "next";
import { useWallet } from "@solana/wallet-adapter-react";

import { WalletButtonImport } from "./WalletContextProvider";
import "./GameBoard.css";

const WalletButton: NextPage = () => {
  const { publicKey } = useWallet();
  return (
    <main className="flex items-center justify-center">
      <div className="border hover:border-slate-900 rounded">
        <WalletButtonImport>
          {publicKey
            ? publicKey.toBase58().substring(0, 6) + "..."
            : "Connect!"}
        </WalletButtonImport>
      </div>
    </main>
  );
};
export default WalletButton;
