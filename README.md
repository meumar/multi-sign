# Multi-Signature Wallet on Solana

This is a multi-signature wallet application built on the Solana blockchain using the Anchor framework. The application allows users to create wallets with multiple members, set a transaction approval threshold, send SOL to the wallet, and transfer SOL from the wallet to other addresses with the required approval from members. Users can also view the transaction history of the wallet.

## Features

- **Create Wallet:** Users can create a wallet with up to 5 members and define a transaction approval threshold.
- **Send SOL:** Users can send SOL to the wallet.
- **Transfer SOL:** Initiate transfers from the wallet to any Solana address, with the requirement of approval from members based on the defined threshold.
- **Approval Mechanism:** A transaction can only be executed if the number of approvals meets the defined threshold.
- **Transaction History:** Users can view the history of transactions, including initiated transfers and approvals.

##Accounts used

![alt text](https://github.com/meumar/my-files/blob/main/Multi-sign.jpg?raw=true)


## Getting Started

### Prerequisites

- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- Node.js and npm
- A code editor like Visual Studio Code

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/multi-sig-wallet-solana.git
   cd multi-sig-wallet-solana
