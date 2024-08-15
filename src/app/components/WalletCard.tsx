import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingComponent from "./Loading";

const WalletCard = ({
  name,
  wallet_address,
  balance,
}: {
  name: string;
  wallet_address: string;
  balance: number;
}) => {
  const [gamesLoading, setGamesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const router = useRouter();
  const openWallet = () => {
    router.push(`/wallets/view/${wallet_address}`);
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 sd:w-full">
      <a href="#">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
          {name}
        </h5>
      </a>
      <p className="mb-3 font-normal text-gray-700 dark:text-gray-400 truncate">
        Wallet address: {wallet_address}
      </p>
      <p className="mb-3 font-normal text-gray-700 dark:text-gray-400 truncate">
        Balance: {balance}
      </p>
      <p className="text-red-400">{error}</p>
      {gamesLoading ? (
        <LoadingComponent />
      ) : (
        <a
          href="#"
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={openWallet}
        >
          Open wallet
          <svg
            className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </a>
      )}
    </div>
  );
};

export default WalletCard;
