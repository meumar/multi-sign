"use client";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useParams } from "next/navigation";
import { useConnection } from "@solana/wallet-adapter-react";
import * as borsh from "@coral-xyz/borsh";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { PROGRAM_ID } from "../../../constants";
import { useProgram, getWalletAta } from "./WalletContextProvider";
import GameBoard from "@/app/components/gameBoard";

import { validateSolAddress } from "../../../utils/index";

const WalletComponent: NextPage = () => {
  const { game_address } = useParams<{ game_address: string }>();

  const [currentUserSymbol, setCurrentUserSymbol] = useState<number>(1);
  const [userIsNotPlayer, setUserIsNotPlayer] = useState<boolean>(false);
  const [invalidGame, setInvalidGame] = useState<boolean>(false);
  const [gameState, setGameSate] = useState<number>(0);
  const [currentTurn, setCurrentTurn] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [gameData, setGameData] = useState<number[]>([]);

  const [currentPlayer, setCurrentPlayer] = useState<string>("");

  const [player, setPlayer] = useState<string>("");
  const [otherPlayer, setOtherPlayer] = useState<string>("");

  const { connection } = useConnection();
  const { publicKey }: any = useWallet();
  const program = useProgram();

  const pubkeyModal = borsh.struct([
    borsh.publicKey("player"),
    borsh.publicKey("token_account"),
    borsh.u64("bet_amount"),

    borsh.u8("game_state"),
  ]);

  const gamStateModal = borsh.struct([
    borsh.publicKey("turn"),
    borsh.publicKey("other_player"),
    borsh.publicKey("winner"),
  ]);

  const fetchData = () => {
    if (publicKey) {
      const valid = validateSolAddress(game_address);
      if (valid) {
        getGameDetails(new PublicKey(game_address));
      } else {
        setInvalidGame(true);
      }
    }
  };

  useEffect(() => {
    const subscriptionId = program.addEventListener(
      "UserMakeMove",
      (event: any) => {
        let index = event.row * 3 + event.col;

        let initialBoard = Array(9).fill(null);
        let newBoard = initialBoard.map((board, rowIndex) => {
          if (index == rowIndex) {
            board = event.moveSymbol;
          }
          return board;
        });
        setGameData(newBoard);
        setGameSate(event.gameState);
        if (event.nextUser) {
          setCurrentTurn(event.nextUser.toBase58());
          if (currentTurn == currentPlayer) {
            setUserIsNotPlayer(false);
          }
        }
      }
    );
  }, []);

  useEffect(() => {
    if (publicKey) {
      setCurrentPlayer(publicKey.toBase58());
    }
    fetchData();
  }, [publicKey]);
  const getGameDetails = async (address: PublicKey) => {
    let account = await connection.getAccountInfo(address);
    console.log("getGameDetails", PROGRAM_ID, account?.owner.toBase58());
    if (PROGRAM_ID == account?.owner.toBase58()) {
      setGameDetails(account);
    } else {
      setInvalidGame(true);
    }
  };

  const setGameDetails = (account: any) => {
    const offset = 8,
      gameOffset = 8 + 32 + 32 + 1 + 1;

    const { player, token_account, bet_amount, game_state } =
      pubkeyModal.decode(account.data.slice(offset, account.data.length));
    const { turn, other_player, winner } = gamStateModal.decode(
      account.data.slice(gameOffset + 16, account.data.length)
    );
    let win = "";
    try {
      win = winner.toBase58();
    } catch (e) {}
    // console.log("publicKey", publicKey);
    if (
      player.toBase58() === publicKey.toBase58() ||
      other_player.toBase58() == publicKey.toBase58()
    ) {
      setGameSate(game_state);
      if (game_state == 1) {
        setCurrentTurn(turn.toBase58());
        if (turn.toBase58() == publicKey.toBase58()) {
          setUserIsNotPlayer(false);
          if (publicKey.toBase58() == player.toBase58()) {
            setCurrentUserSymbol(1);
          } else {
            setCurrentUserSymbol(2);
          }
        } else {
          setUserIsNotPlayer(true);
        }
      } else {
        setUserIsNotPlayer(true);
      }
    } else {
      setUserIsNotPlayer(true);
    }
    setPlayer(player.toBase58());
    setOtherPlayer(other_player.toBase58());
    setToken(token_account.toBase58());
    let gameData = account.data.slice(gameOffset + 7, gameOffset + 16);
    setGameData(gameData);
    // console.log("player", player.toBase58());
    // console.log("token_account", token_account.toBase58());
    // console.log("bet_amount", bet_amount.toNumber());
    // console.log("game_state", game_state);
    // console.log("turn", turn.toBase58());
    // console.log("other_player", other_player.toBase58());
    // console.log("winner", win);
  };

  const onMove = (row: number, col: number) => {
    makeMove(row, col);
  };

  const makeMove = async (row: number, col: number) => {
    try {
      const [game_wallet, wallet_bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("wallet")],
        new PublicKey(PROGRAM_ID)
      );

      let player_ata = getWalletAta(publicKey, new PublicKey(token));
      let other_player = publicKey.toBase58() == player ? otherPlayer : player;
      console.log("other_player", player_ata.toBase58(), other_player);
      let other_player_ata = getWalletAta(
        new PublicKey(other_player),
        new PublicKey(token)
      );

      const [program_ata] = PublicKey.findProgramAddressSync(
        [new PublicKey(token).toBuffer()],
        new PublicKey(PROGRAM_ID)
      );
      const game_request = new PublicKey(game_address);

      const sign = await program.methods
        .makeMove(row, col, wallet_bump)
        .accounts({
          playerAta: player_ata,
          otherPlayerAta: other_player_ata,
          programAta: program_ata,

          mint: new PublicKey(token),

          gameRequest: game_request,
          gameWallet: game_wallet,
          tokenProgram: TOKEN_PROGRAM_ID,
          signer: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([])
        .rpc();
      console.log(`solana confirm -v ${sign}`);
    } catch (e) {
      console.log("makeMove", typeof e, e);
    }
  };

  let GameState = () => {
    if (gameState == 0) {
      return (
        <div>
          <p className="text-4xl">Waiting for other user!</p>
        </div>
      );
    } else if (gameState == 1) {
      if (currentTurn == publicKey.toBase58()) {
        return (
          <div>
            <p className="text-4xl">
              Your turn {currentUserSymbol == 1 ? "X" : "O"}
            </p>
          </div>
        );
      } else {
        return (
          <div>
            <p className="text-4xl">{currentTurn} turn</p>
          </div>
        );
      }
    } else if (gameState == 2 || gameState == 3) {
      let winner = player;
      if (gameState == 3) {
        winner = otherPlayer;
      }
      return (
        <div>
          <p className="text-4xl">{winner} won the game</p>
        </div>
      );
    } else if (gameState == 4) {
      return (
        <div>
          <p className="text-4xl"> Draw game</p>
        </div>
      );
    }
  };

  if (invalidGame) {
    return (
      <main>
        <div className="text-center mt-72 text-lg">Invalid game</div>
      </main>
    );
  }
  return (
    <main>
      <div className="text-center p-5">
        <GameState />
      </div>
      <div>
        <GameBoard
          onMove={onMove}
          disableGame={userIsNotPlayer}
          currentUserSymbol={currentUserSymbol == 1 ? "X" : "O"}
          gameData={gameData}
        ></GameBoard>
      </div>
    </main>
  );
};

export default WalletComponent;
