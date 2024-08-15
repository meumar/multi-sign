import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";


import CircleText from "./UI/Circle";
import LoadingComponent from "./Loading";
import { useProgram } from "./WalletContextProvider";

const WalletProfile = (walletDetails: any) => {
  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const program = useProgram();
  const { publicKey }: any = useWallet();
  const addFundsToWallet = async () => {
    try {
      setLoading(true);
      const sign = await program.methods
        .transferSolToWallet(new anchor.BN(amount))
        .accounts({
          walletAccount: new PublicKey(walletDetails.wallet_address),
          signer: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([])
        .rpc();
      walletDetails.fetchWalletDetails();
      setLoading(false);
      setAmount(1);
      onClose();
    } catch (e) {
      console.log("addFundsToWallet", e);
      setLoading(false);
    }
  };
  return (
    <main>
      <div className="p-5">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <CircleText text={walletDetails.name} color="red" size={126} />
        </div>
        <div className="text-gray-300 text-sm text-center mt-3">
          <span>{walletDetails.balance} SOL</span>
          <div className="mt-3">
            <button
              className="bg-blue-900 rounded-lg text-slate-100 px-5 py-2 font-semibold"
              color="primary"
              onClick={onOpen}
            >
              Add funds
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="bg-slate-900"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {"Add funds to wallet"}
              </ModalHeader>
              <ModalBody>
                <form>
                  <div className="grid gap-6 mb-6 md:grid-cols-1">
                    <div>
                      <label
                        htmlFor="first_name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Amount
                      </label>
                      <input
                        type="number"
                        id="name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Name"
                        required
                        value={amount}
                        onChange={(value) =>
                          setAmount(Number(value.target.value))
                        }
                      />
                    </div>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <button color="danger" onClick={onClose}>
                  Close
                </button>
                {loading ? (
                  <LoadingComponent />
                ) : (
                  <button
                    className="bg-blue-900 rounded-lg text-slate-100 px-2 py-2 font-semibold"
                    color="primary"
                    onClick={addFundsToWallet}
                    disabled={!amount}
                  >
                    Transfer
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

export default WalletProfile;
