"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { Card, CardBody } from "@nextui-org/card";

import { PROGRAM_ID } from "../../../../../constants";
import {
  validateSolAddress,
  walletAccoutDesiriazation,
} from "../../../../../utils";
import WalletProfile from "@/app/components/WalletProfile";
import WalletTransactions from "@/app/components/Transactions";

import { getInboundTransactions } from "../../../../../utils";
import TableTransactions from "@/app/components/HistoryTable";

export default function WalletPage() {
  const { wallet_address } = useParams<{ wallet_address: string }>();
  const [invalidWallet, setInvalidWallet] = useState<boolean>(false);
  const [walletDetails, setWalletDetails] = useState<any>({});
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);

  const { publicKey }: any = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    fetchWalletDetails();
  }, [publicKey]);

  const fetchWalletDetails = async () => {
    if (publicKey) {
      const valid = validateSolAddress(wallet_address);
      if (valid) {
        setInvalidWallet(true);
      } else {
        getWalletInfo(new PublicKey(wallet_address));
        const transactions = await getInboundTransactions(wallet_address);
        setWalletTransactions(
          transactions.map((e: any) => {
            e.key = e.signature;
            return e;
          })
        );
        console.log("transactions", transactions);
      }
    }
  };

  const getWalletInfo = async (address: PublicKey) => {
    let [account, lamports] = await Promise.all([
      connection.getAccountInfo(address),
      connection.getBalance(address),
    ]);
    if (PROGRAM_ID == account?.owner.toBase58()) {
      let decimals = 9;
      const balance = lamports / Math.pow(10, decimals);

      decodeAccountData(account, balance, lamports);
    } else {
      setInvalidWallet(true);
    }
  };

  const decodeAccountData = (
    account: any,
    balance: number,
    lamports: number
  ) => {
    const { created_by, threshold, name, user1, user2, user3, user4, user5 } =
      walletAccoutDesiriazation(account);
    setWalletDetails({
      created_by,
      threshold,
      name,
      user1,
      user2,
      user3,
      user4,
      user5,
      balance,
      lamports,
    });
  };

  if (invalidWallet) {
    return (
      <main>
        <div className="text-center mt-72 text-lg">Invalid wallet</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between py-10">
      <div>
        {/* <WalletComponent /> */}
        <Card className="bg-gray-900 p-3 w-screen">
          <CardBody>
            <div className="flex flex-row gap-6">
              <div className="basis-1/4 p-4 bg-slate-800 rounded-lg text-center">
                <WalletProfile
                  {...walletDetails}
                  wallet_address={wallet_address}
                  fetchWalletDetails={fetchWalletDetails}
                />
              </div>
              <div className="basis-3/4 p-5 bg-slate-800 rounded-lg w-max">
                {walletDetails?.created_by && (
                  <WalletTransactions
                    wallet_address={wallet_address}
                    balance={walletDetails.lamports}
                    created_by={walletDetails.created_by}
                    wallent_name={walletDetails.name}
                  />
                )}
              </div>
            </div>
            <div className="mt-5">
              <h1 className="text-gray-100 mb-2 text-xl">Wallet transactions</h1>
              <TableTransactions
                rows={walletTransactions}
                label="Wallet history"
                columns={[
                  {
                    key: "signature",
                    label: "Signature",
                  },
                  {
                    key: "amount",
                    label: "Amount",
                  },
                  {
                    key: "transactionDate",
                    label: "Date & time",
                  },
                ]}
              ></TableTransactions>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
