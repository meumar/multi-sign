import { PublicKey } from "@solana/web3.js";
import * as borsh from "@coral-xyz/borsh";

export const validateSolAddress = (address: string) => {
  try {
    let pubkey = new PublicKey(address);
    let isSolana = PublicKey.isOnCurve(pubkey.toBuffer());
    return isSolana;
  } catch (error) {
    return false;
  }
};

export const newPublicKey = (address: string) => {
  return new PublicKey(address);
};

export const accountDetails = borsh.struct([
  borsh.bool("is_transaction"),
  borsh.publicKey("created_by"),
  borsh.u64("threshold"),
  borsh.str("name"),
  borsh.publicKey("user1"),
  borsh.publicKey("user2"),
  borsh.publicKey("user3"),
  borsh.publicKey("user4"),
  borsh.publicKey("user5"),
]);


export const walletAccoutDesiriazation = (account: any) => {
  const offset = 8;
  const { is_transaction, name, created_by, threshold, user1, user2, user3, user4, user5 } = accountDetails.decode(
    account.data.slice(offset, account.data.length)
  );
  return {
    is_transaction: is_transaction,
    created_by: created_by.toBase58(),
    threshold: threshold.toNumber(),
    name,
    user1: user1.toBase58(),
    user2: user2.toBase58(),
    user3: user3.toBase58(),
    user4: user4.toBase58(),
    user5: user5.toBase58(),
  };
};

export const transactionDetails = borsh.struct([
  borsh.bool("is_transaction"),
  borsh.publicKey("wallet_account"),
  borsh.publicKey("created_by"),
  borsh.u64("threshold"),
  borsh.publicKey("reciever"),
  borsh.u64("completed_signers"),
  borsh.u64("timestamp"),
  borsh.u64("amount"),
  borsh.u8("status"),
  borsh.str("name"),
]);

export const transactionAccoutDesiriazation = (account: any) => {
  const offset = 8,
    usersOffset = 8 + 32 + 1 + 18;
  const {
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
  } = transactionDetails.decode(
    account.data.slice(offset, account.data.length)
  );

  return {
    is_transaction: is_transaction,
    created_by: created_by.toBase58(),
    threshold: threshold.toNumber(),
    name,
    amount: amount.toNumber(),
    wallet_account: wallet_account.toBase58(),
    reciever: reciever.toBase58(),
    completed_signers: completed_signers.toNumber(),
    timestamp: new Date(timestamp.toNumber() * 1000).toLocaleString(),
    status: status,
  };
};

export const checkTransaction = borsh.struct([borsh.bool("is_transaction")]);

export const checkIsTransactionAccount = (account: any) => {
  const offset = 8;
  const { is_transaction } = transactionDetails.decode(
    account.data.slice(offset, account.data.length)
  );
  return is_transaction;
};

export const transactionSignDetails = borsh.struct([
  borsh.publicKey("transaction_account"),
  borsh.publicKey("wallet_account"),
  borsh.publicKey("signer"),
  borsh.u64("timestamp"),
]);

export const transactionSignAccoutDesiriazation = (account: any) => {
  const offset = 8;
  const { transaction_account, wallet_account, signer, timestamp } =
    transactionSignDetails.decode(
      account.data.slice(offset, account.data.length)
    );

  return {
    signer: signer.toBase58(),
    wallet_account: wallet_account.toBase58(),
    transaction_account: transaction_account.toBase58(),
    timestamp: new Date(timestamp.toNumber() * 1000).toLocaleString(),
  };
};
