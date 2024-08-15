import {
  PublicKey,
  Connection,
  clusterApiUrl,
  GetProgramAccountsConfig,
} from "@solana/web3.js";
import { PROGRAM_ID } from "../../../../../constants";

let connection = new Connection(clusterApiUrl("devnet"), "confirmed");

import {
  validateSolAddress,
  transactionAccoutDesiriazation,
  checkIsTransactionAccount,
} from "../../../../../utils/index";

const GET = async (
  request: Request,
  { params }: { params: { wallet_address: string } }
) => {
  try {
    const checkAddress = validateSolAddress(params.wallet_address);
    console.log("checkAddress", checkAddress, params.wallet_address);
    // if (!checkAddress) {
    //   return Response.json([]);
    // }
    const config: GetProgramAccountsConfig = {
      filters: [
        {
          memcmp: {
            offset: 9,
            bytes: params.wallet_address
          }
        }
      ],
    };
    let accounts = await connection.getProgramAccounts(
      new PublicKey(PROGRAM_ID),
      config
    );
    let filteredAccounts = await filterWallets(accounts, params.wallet_address);
    return Response.json(filteredAccounts);
  } catch (e) {
    return Response.json([]);
  }
};

const filterWallets = async (filterWallets: any, address: string) => {
  try {
    let accounts: any = [];
    await Promise.all(
      filterWallets.map(async ({ pubkey, account }: any) => {
        const is_transaction = checkIsTransactionAccount(account);
        if (is_transaction) {
          const {
            wallet_account,
            name,
            amount,
            created_by,
            threshold,
            reciever,
            completed_signers,
            timestamp,
            status,
          } = transactionAccoutDesiriazation(account);
          accounts.push({
            is_transaction,
            wallet_account,
            name,
            amount,
            created_by,
            threshold,
            reciever,
            completed_signers,
            timestamp,
            status,
            transaction_address: pubkey.toBase58(),
          });
        }
        return pubkey;
      })
    );
    return accounts;
  } catch (error) {
    return [];
  }
};

const checkUserExisted = (users: string[], address: string) => {
  return users.includes(address);
};

export { GET };
