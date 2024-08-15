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
  walletAccoutDesiriazation,
  checkIsTransactionAccount,
} from "../../../../../utils/index";

const GET = async (
  request: Request,
  { params }: { params: { public_address: string } }
) => {
  try {
    const checkAddress = validateSolAddress(params.public_address);
    if (!checkAddress) {
      return Response.json([]);
    }
    const config: GetProgramAccountsConfig = {
      filters: [
        // {
        //   memcmp: {
        //     offset: 8,
        //     bytes: "1",
        //   },
        // },
      ],
    };
    let accounts = await connection.getProgramAccounts(
      new PublicKey(PROGRAM_ID),
      config
    );
    let filteredAccounts = await filterWallets(accounts, params.public_address);
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
        try {
          const is_transaction = checkIsTransactionAccount(account);
          if (!is_transaction) {
            const {
              created_by,
              threshold,
              name,
              user1,
              user2,
              user3,
              user4,
              user5,
            } = walletAccoutDesiriazation(account);
            const allUsers = [user1, user2, user3, user4, user5];
            let check = checkUserExisted(allUsers, address);
            if (check) {
              let decimals = 9;
              let lamports = await connection.getBalance(new PublicKey(pubkey));
              const sol = lamports / Math.pow(10, decimals);
              accounts.push({
                is_transaction,
                name,
                created_by,
                threshold,
                wallet_address: pubkey.toBase58(),
                users: allUsers,
                balance: sol,
                lamports: lamports,
              });
              console.log("CHECK 4");
            }
          }
          return pubkey;
        } catch (e) {}
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
