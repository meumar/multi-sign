import {
    PublicKey,
    Connection,
    clusterApiUrl,
    GetProgramAccountsConfig,
  } from "@solana/web3.js";
  import { PROGRAM_ID } from "../../../../../../constants";
  
  let connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
  import {
    validateSolAddress,
    transactionSignAccoutDesiriazation,
  } from "../../../../../../utils/index";
  
  const GET = async (
    request: Request,
    { params }: { params: { wallet_address: string, transaction_address: string } }
  ) => {
    try {
      const checkAddress1 = validateSolAddress(params.wallet_address);
      const checkAddres2 = validateSolAddress(params.transaction_address);
      console.log("checkAddress", checkAddress1, checkAddres2, params.wallet_address, params.transaction_address);
      // if (!checkAddress) {
      //   return Response.json([]);
      // }
      const config: GetProgramAccountsConfig = {
        filters: [
          {
            memcmp: {
              offset: 8,
              bytes: params.transaction_address
            }
          },
          {
            memcmp: {
              offset: 40,
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
          const {
            wallet_account,
            signer,
            transaction_account,
            timestamp
          } = transactionSignAccoutDesiriazation(account);
          accounts.push({
            wallet_account,
            signer,
            transaction_account,
            timestamp,
            transaction_signature_address: pubkey.toBase58(),
          });
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
  