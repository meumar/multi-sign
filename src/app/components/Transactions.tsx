import { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { toast } from "react-toastify";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";

import { useProgram } from "./WalletContextProvider";
import { validateSolAddress } from "../../../utils";
import { PROGRAM_ID } from "../../../constants";
import LoadingComponent from "./Loading";
import WalletSignTransactions from "./HistoryTable";

interface TransactionsProps {
  wallet_address: string;
  balance: number;
  created_by: string;
  wallent_name: string;
}

const WalletTransactions: React.FC<TransactionsProps> = ({
  wallet_address,
  balance,
  created_by,
  wallent_name,
}) => {
  const [name, setName] = useState<string>("");
  const [amount, setAmount] = useState<number>(1);
  const [reciver, setReciver] = useState<string>("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false);
  const [transactionHistory, setTransactionHistory] = useState<any>({});
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [alreadySigned, setAlreadySigned] = useState<any>({});

  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const program = useProgram();
  const { publicKey }: any = useWallet();

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const addNewTransaction = async () => {
    const check = validateSolAddress(reciver);
    if (!check) {
      toast.error("Please enter valid address");
    } else if (balance < amount) {
      toast.error("Insufficient balance");
    } else {
      try {
        setLoading(true);
        const [transaction_account, transaction_bump] =
          PublicKey.findProgramAddressSync(
            [
              Buffer.from("multisigntransaction"),
              new PublicKey(wallet_address).toBuffer(),
              publicKey.toBuffer(),
              new PublicKey(reciver).toBuffer(),
              Buffer.from(name.trim()),
            ],
            new PublicKey(PROGRAM_ID)
          );
        const sign = await program.methods
          .createMultiSignTransaction(name, new anchor.BN(amount))
          .accounts({
            transactionAccount: transaction_account,
            walletAccount: new PublicKey(wallet_address),
            reciever: new PublicKey(reciver),
            signer: publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([])
          .rpc();
        setLoading(false);
        toast.success("Succefully created ");
        fetchAllTransactions();
        onClose();
      } catch (e) {
        console.log("Error", e);
        setLoading(false);
        toast.error("Something went wrong");
      }
    }
  };

  const signTransaction = async (
    transaction_account: string,
    reciever: string
  ) => {
    try {
      setLoading(true);
      const [
        transaction_signature_account,
        transaction_signature_account_bump,
      ] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("transactionsignature"),
          new PublicKey(wallet_address).toBuffer(),
          new PublicKey(transaction_account).toBuffer(),
          publicKey.toBuffer(),
        ],
        new PublicKey(PROGRAM_ID)
      );

      const [user_wallet, wallet_bump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("multisigwallet"),
          new PublicKey(created_by).toBuffer(),
          Buffer.from(wallent_name.trim()),
        ],
        new PublicKey(PROGRAM_ID)
      );
      const sign = await program.methods
        .createSignAccount(wallet_bump)
        .accounts({
          transactionSignatureAccount: transaction_signature_account,
          walletAccount: new PublicKey(wallet_address),
          transactionAccount: new PublicKey(transaction_account),
          signer: publicKey,
          reciever: new PublicKey(reciever),
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([])
        .rpc();
      setLoading(false);
      toast.success("Succefully created ");
      fetchAllTransactions();
      onClose();
    } catch (e) {
      console.log("Error", e);
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  const fetchAllTransactions = async () => {
    try {
      setTransactionLoading(true);
      const res = await fetch(`/api/transactions/${wallet_address}`);
      const mappedAccounts = await res.json();
      setTransactions(mappedAccounts);
      if (mappedAccounts.length) {
        fetchAllTransactionSignatures(mappedAccounts);
      }
      setTransactionLoading(false);
    } catch (e) {}
  };
  const fetchAllTransactionSignatures = async (mappedAccounts: any) => {
    try {
      let history: any = {},
        signedHistory: any = {};
      await Promise.all(
        mappedAccounts.map(async (tran: any) => {
          const res = await fetch(
            `/api/signatures/${wallet_address}/${tran.transaction_address}`
          );
          const mappedSignatures = await res.json();
          history[tran.transaction_address] = mappedSignatures;
          signedHistory[tran.transaction_address] = mappedSignatures.find(
            (e: any) => e.signer == publicKey.toBase58()
          )
            ? true
            : false;
        })
      );
      setTransactionHistory(history);
      setAlreadySigned(signedHistory);
    } catch (e) {}
  };

  const openHistory = (history: any) => {
    setHistory(history);
    setShowHistory(true);
    onOpen();
  };

  const openTransactionAdd = () => {
    setShowHistory(false);
    onOpen();
  };
  return (
    <main>
      <div className="p-5">
        <div className="grid gap-4 w-fill">
          <div className="col-start-1 col-end-2">
            <h1 className="font-semibold text-xl text-gray-400">
              Transactions
            </h1>
          </div>
          <div className="col-end-9 col-span-2 text-right">
            <button
              className="bg-blue-900 rounded-lg text-slate-100 px-5 py-2 font-semibold"
              onClick={openTransactionAdd}
            >
              Add new
            </button>
          </div>
        </div>
        <div className="text-gray-300 text-sm mt-3">
          {transactions.length ? (
            <div className="flex flex-row gap-5 rounded-md w-full mb-1">
              <h1 className="basis-3/4">Name</h1>
              <p className="basis-1/4 text-center">{`Amount(Lamports)`}</p>
              <p className="basis-1/4 text-right"></p>
              <p className="basis-1/4"></p>
            </div>
          ) : null}
          <div className="bg-slate-900 rounded-md w-full border-gray-900 border-2">
            {transactions.map((tran: any) => (
              <div
                key={tran.transaction_address}
                className="flex flex-row gap-5  py-2 px-2 "
              >
                <div className="basis-3/4">
                  <h1 className="text-xl">
                    {tran.name} ({tran.completed_signers}/{tran.threshold})
                  </h1>
                  <p className="text-xs">{tran.timestamp}</p>
                </div>

                <div className="basis-1/4 text-center">
                  <h1 className="text-xl">{tran.amount}</h1>
                  <p className="text-xs truncate font-bold">
                    TO: {tran.reciever.substring(0, 6)}...
                    {tran.reciever.substring(38, 44)}
                  </p>
                </div>
                <div className="basis-1/4 text-right text-xl">
                  {transactionHistory &&
                  transactionHistory[tran.transaction_address] ? (
                    <button
                      className="text-slate-100 px-5 py-1 font-semibold"
                      onClick={() =>
                        openHistory(
                          transactionHistory[tran.transaction_address]
                        )
                      }
                    >
                      View History
                    </button>
                  ) : null}
                </div>
                <div className="basis-1/4 text-right text-xl">
                  {tran.status == 4 ? (
                    <h3 className="text-slate-100 px-5 py-1 font-semibold">
                      Completed
                    </h3>
                  ) : alreadySigned &&
                    alreadySigned[tran.transaction_address] ? (
                    <h3 className="text-slate-100 px-5 py-1 font-semibold">
                      Sigend
                    </h3>
                  ) : (
                    <button
                      className="bg-blue-900 rounded-lg text-slate-100 px-5 py-1 font-semibold"
                      onClick={() =>
                        signTransaction(tran.transaction_address, tran.reciever)
                      }
                    >
                      Execute
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!transactions.length && (
              <div className="text-center p-4">
                <h2>There is no transactions for this wallet</h2>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        size={showHistory ? "2xl" : "md"}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="bg-slate-900"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {showHistory ? "History" : "Add new transaction"}
              </ModalHeader>
              <ModalBody>
                {showHistory ? (
                  <div>
                    <WalletSignTransactions
                      history={history}
                    ></WalletSignTransactions>
                  </div>
                ) : (
                  <form>
                    <div className="grid gap-6 mb-6 md:grid-cols-1">
                      <div>
                        <label
                          htmlFor="first_name"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
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
                          Amount
                        </label>
                        <input
                          type="number"
                          id="amount"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="Amount"
                          required
                          value={amount}
                          onChange={(value) =>
                            setAmount(Number(value.target.value))
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="last_name"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Reciever
                        </label>
                        <input
                          type="text"
                          id="reciver"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="Address"
                          required
                          value={reciver}
                          onChange={(value) => setReciver(value.target.value)}
                        />
                      </div>
                    </div>
                  </form>
                )}
              </ModalBody>
              <ModalFooter>
                <button color="danger" onClick={onClose}>
                  Close
                </button>
                {showHistory ? null : loading ? (
                  <LoadingComponent />
                ) : (
                  <button
                    className="bg-slate-600 py-1 px-2 rounded-lg"
                    color="primary"
                    onClick={addNewTransaction}
                    disabled={!name || !amount || !reciver}
                  >
                    Add
                  </button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
};

export default WalletTransactions;
