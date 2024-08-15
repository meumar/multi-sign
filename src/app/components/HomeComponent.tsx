import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";

import { PROGRAM_ID } from "../../../constants";
import { useProgram } from "./WalletContextProvider";

const HomeComponent: NextPage = () => {
  const [gamesLoading, setGamesLoading] = useState<boolean>(false);

  const { connection } = useConnection();

  const { publicKey }: any = useWallet();
  const program = useProgram();

  useEffect(() => {
  }, []);

  return (
    <div>

    </div>
  );
};
export default HomeComponent;
