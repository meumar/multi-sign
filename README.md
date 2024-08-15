# Solana Smart Contract Game with Anchor and Next.js

## Overview

This project implements a simple game on the Solana blockchain using the Anchor framework for the smart contract and Next.js for the user interface (UI). The game allows users to connect their wallets, create or join a game, and bet SPL tokens. The game is designed for two players, and the winner takes the total bet amount. If the game ends in a draw, the bet amount is returned to each player.


## Flow

![alt text](https://github.com/meumar/my-files/blob/main/Game_flow.png?raw=true)


## Features

- **Wallet Integration**: Users can connect their Solana wallets directly through the UI.
- **Game Creation**: Users can create a new game by specifying the SPL token address and the bet amount.
- **Join Game**: Other users can join an existing game by choosing the bet amount and the same SPL tokens.
- **Gameplay**: The game requires two players. The winner takes the total bet amount, or if it's a draw, the bet amount is returned to each player.
- **Token Transfer**: The smart contract manages the transfer of SPL tokens securely.

## Project Structure

- **Smart Contract**: Built using the [Anchor framework](https://project-serum.github.io/anchor/).
- **Frontend**: Developed with [Next.js](https://nextjs.org/) for creating the UI.

## Prerequisites

- [Node.js](https://nodejs.org/en/)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- [Next.js](https://nextjs.org/docs/getting-started) (for frontend)
- [Phantom Wallet](https://phantom.app/) or other Solana-compatible wallets.

# multi-sign
