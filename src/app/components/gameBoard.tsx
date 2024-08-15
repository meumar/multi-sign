import React, { useEffect, useState } from "react";
import "./GameBoard.css";

export default function GameBoard({
  onMove,
  disableGame,
  currentUserSymbol,
  gameData,
}: {
  onMove: (row: number, col: number) => void;
  disableGame: Boolean;
  currentUserSymbol: string;
  gameData: number[];
}) {
  let initialBoard = Array(3)
    .fill(null)
    .map(() => Array(3).fill(null));
  const [board, setBoard] = React.useState(initialBoard);
  const handleClick = (row: number, col: number) => {
    if (disableGame) return;
    if (board[row][col]) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[row][col] = currentUserSymbol;
    setBoard(newBoard);
    onMove(row, col);
  };

  useEffect(() => {
    console.log("gameData", gameData);
    if (gameData.length) {
      let counter = 0;
      const newBoard = board.map((row) => [...row]);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (gameData[counter] == 1 || gameData[counter] == 2) {
            newBoard[r][c] = gameData[counter] == 1 ? "X" : "O";
          }
          counter++;
        }
      }
      console.log("newBoard", newBoard);
      setBoard(newBoard);
    }
  }, [gameData]);

  return (
    <div className="game-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={
                disableGame
                  ? "cursor-no-drop board-cell"
                  : "board-cell cursor-pointer"
              }
              onClick={() => handleClick(rowIndex, colIndex)}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
