import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import type { HelloAnchor } from "../target/types/hello_anchor";

describe("Test", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.HelloAnchor as anchor.Program<HelloAnchor>;
  
  it("close pda", async () => {
    let walletAccountPda = new web3.PublicKey(
      "6MmSFjDxbKV4xPaLMwv1kgkigDU1eTAZ77wQ5syif9uf"
    );
    let transactionSignaturePda = new web3.PublicKey(
      "2ZhxdaEL3LBaKj3eXrAKFaP5ooLZdqFTV1xoXbUCMKP3"
    );
    const txHash = await program.methods
      .closePdaAccount()
      .accounts({
        walletAccount: walletAccountPda,
        transactionSignatureAccount: transactionSignaturePda,
        recipient: program.provider.publicKey,
      })
      .rpc();
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  });
});
