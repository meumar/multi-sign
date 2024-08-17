"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { toast } from "react-toastify";

import { useProgram } from "./WalletContextProvider";
// import idl from "../../../idl.json";

import { useConnection } from "@solana/wallet-adapter-react";

import { PROGRAM_ID } from "../../../constants";
import { PublicKey } from "@solana/web3.js";
import LoadingComponent from "./Loading";

import { validateSolAddress } from "../../../utils";

export default function CreateWallet() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [threshold, setThreshold] = useState<number>(1);
  const [users, setUsers] = useState<string[]>([]);
  const [newUser, setNewUser] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const { publicKey }: any = useWallet();
  const { connection } = useConnection();
  const program = useProgram();
  useEffect(() => {
    if (!publicKey) {
      setError("Please connect your wallet!");
    } else {
      setUsers([publicKey.toBase58()]);
      setError("");
    }
  }, [publicKey]);

  const ensureFiveLengthArray = (arr: string[], str: string) => {
    while (arr.length < 5) {
      arr.push(str);
    }
    return arr.slice(0, 5);
  };

  const createWallet = async () => {
    if (users.length < 2) {
      toast.warn("Please add atleast 2 wallet addresses");
      return;
    }
    try {
      setLoading(true);
      const [user_wallet, wallet_bump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("multisigwallet"),
          publicKey.toBuffer(),
          Buffer.from(name.trim()),
        ],
        new PublicKey(PROGRAM_ID)
      );
      let changesdUsers = users;
      changesdUsers = ensureFiveLengthArray(changesdUsers, '11111111111111111111111111111111');
      const sign = await program.methods
        .createMultiSignWallet(
          name,
          new anchor.BN(threshold),
          changesdUsers.map((e) => new PublicKey(e))
        )
        .accounts({
          walletAccount: user_wallet,
          signer: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([])
        .rpc();
      console.log(`solana confirm -v ${sign}`);
      setLoading(false);
      toast.success("Submit");
      router.push("/wallets");
    } catch (e) {
      console.log("Error", e);
      setLoading(false);
      toast.error("Something went wrong");
    }
  };
  const addUser = () => {
    const check = validateSolAddress(newUser);
    if (check) {
      setUsers([...users, ...[newUser]]);
      setNewUser("");
      setError("");
    } else {
      toast.error("Please enter valid address");
    }
  };

  const removeUser = (name: string) => {
    setUsers(users.filter((addr) => addr !== name));
  };

  return (
    <main className="flex items-center justify-center">
      <>
        <div className="justify-center items-center flex w-full">
          <div className="relative w-full my-6 mx-auto max-w-3xl">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full dark:bg-gray-800 outline-none ">
              <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                <h3 className="text-3xl font-semibold">Create wallet</h3>
              </div>
              <div className="relative px-6 py-2 flex-auto">
                <form>
                  <div className="grid gap-6 mb-6 md:grid-cols-1">
                    <div>
                      <label
                        htmlFor="first_name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Wallet name
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Name"
                        required
                        value={name}
                        onChange={(value) => setName(value.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="last_name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Threshold
                      </label>
                      <input
                        type="number"
                        id="last_name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="1"
                        required
                        value={threshold}
                        min={1}
                        max={users.length}
                        onChange={(value) =>
                          setThreshold(Number(value.target.value))
                        }
                      />
                    </div>
                  </div>
                </form>

                <div className="flex flex-row gap-3 border-t border-solid border-blueGray-200 pt-5">
                  <input
                    type="text"
                    id="last_name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Add new address"
                    required
                    value={newUser}
                    onChange={(value) => setNewUser(value.target.value)}
                  />
                  <button disabled={!newUser || users.length >= 5} onClick={() => addUser()}>
                    Add
                  </button>
                </div>
                <div className="mt-3 mb-5">
                  {users.map((user, index) => (
                    <div key={index} className="flex flex-row gap-3 mt-5">
                      <p className="mt-3">{index + 1}</p>
                      <input
                        type="text"
                        id="first_name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Name"
                        required
                        value={user}
                        disabled={true}
                      />
                      <button
                        className="mt-1 text-red-500"
                        onClick={() => removeUser(user)}
                        disabled={users.length == 1}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {error && (
                <div
                  className="px-3 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                  role="alert"
                >
                  <span className="font-medium">Warning!</span> {error}
                </div>
              )}
              <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                {loading ? (
                  <LoadingComponent />
                ) : (
                  <>
                    {publicKey && (
                      <button
                        className="text-blue-500"
                        type="button"
                        onClick={() => createWallet()}
                        disabled={!name || !users.length || threshold <= 0}
                      >
                        {"Create wallet"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    </main>
  );
}
