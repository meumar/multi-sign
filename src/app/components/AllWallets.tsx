"use client";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useWallet } from "@solana/wallet-adapter-react";

import { useConnection } from "@solana/wallet-adapter-react";

import WalletCard from "./WalletCard";
import LoadingComponent from "./Loading";

const AllWallets: NextPage = () => {
  const [allWallets, setAllWallets] = useState<any>([]);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);

  const { connection } = useConnection();
  const { publicKey }: any = useWallet();

  useEffect(() => {
    fetchAllWallets();
  }, [publicKey]);

  const fetchAllWallets = async () => {
    if (publicKey) {
      setWalletLoading(true);
      const res = await fetch(`/api/wallets/${publicKey.toBase58()}`);
      const mappedAccounts = await res.json();
      setWalletLoading(false);
      setAllWallets(mappedAccounts);
    }
  };
  return (
    <div>
      {walletLoading ? (
        <LoadingComponent />
      ) : (
        <>
          {!allWallets.length && (
            <div className="text-center">
              <h2>There is no wallets. Please try to create wallet</h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allWallets.map((acc: any, index: any) => {
              return (
                <div key={acc.wallet_address + "_" + index}>
                  <WalletCard {...acc} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AllWallets;
