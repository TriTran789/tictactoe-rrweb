"use client";
import { History } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import * as rrweb from "rrweb";

type SymbolMap = {
  [key: number]: string;
};

const App: React.FC = () => {
  const [step, setStep] = useState<number>(0); // 0 = choose symbol, 1 = choose who starts, 2 = play
  const [start, setStart] = useState<number>(0); // 1 = computer, -1 = player
  const [turn, setTurn] = useState<number>(0); // 1 = computer, -1 = player
  const [board, setBoard] = useState<number[]>(Array(9).fill(0));
  const [playing, setPlaying] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [symbols, setSymbols] = useState<SymbolMap>({});
  const [winnerLine, setWinnerLine] = useState<number[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [stopFn, setStopFn] = useState<(() => void) | undefined>(undefined);

  const delay: number = Number(process.env.VITE_AI_DELAY ?? 500); // AI delay milliseconds
  const usingAB: boolean = Boolean(process.env.VITE_USING_AB ?? true); // Using Alpha-Beta Pruning

  const showCell = (cell: number): string => {
    return cell === 0 ? "" : symbols[cell];
  };

  const handleNextStep = (): void => {
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = (): void => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSetStart = (start: number): void => {
    setBoard(Array(9).fill(0));
    setWinner(null);
    setWinnerLine([]);
    setStart(start);
    setTurn(start === 1 ? 1 : -1);
    setPlaying(true);
    handleNextStep();
  };

  const countEmptyBoard = (tempBoard: number[]): number => {
    return tempBoard.filter((cell) => cell === 0).length;
  };

  const canMove = (tempBoard: number[]): boolean => {
    return tempBoard.includes(0);
  };

  const checkWinner = (tempBoard: number[], end = false): number | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (
        tempBoard[a] &&
        tempBoard[a] === tempBoard[b] &&
        tempBoard[a] === tempBoard[c]
      ) {
        if (end) setWinnerLine([a, b, c]);
        return tempBoard[a];
      }
    }
    return null;
  };

  const minimax = useCallback(
    (tempBoard: number[], depth: number, isMaximizing: boolean): number => {
      const result = checkWinner(tempBoard);
      if (result !== null) {
        return result;
      } else if (!canMove(tempBoard)) {
        return 0;
      }

      let bestScore = isMaximizing ? -Infinity : Infinity;
      for (let i = 0; i < tempBoard.length; i++) {
        if (tempBoard[i] === 0) {
          tempBoard[i] = isMaximizing ? 1 : -1;
          const score = minimax(tempBoard, depth + 1, !isMaximizing);
          tempBoard[i] = 0;
          bestScore = isMaximizing
            ? Math.max(score, bestScore)
            : Math.min(score, bestScore);
        }
      }
      return bestScore;
    },
    []
  );

  const abminimax = useCallback(
    (
      tempBoard: number[],
      depth: number,
      player: number,
      alpha: number,
      beta: number
    ): [number, number] => {
      const result = checkWinner(tempBoard);
      if (result !== null) {
        return [-1, result];
      } else if (depth === 9 || !canMove(tempBoard)) {
        return [-1, 0];
      }

      let move = -1;
      for (let i = 0; i < tempBoard.length; i++) {
        if (tempBoard[i] === 0) {
          tempBoard[i] = player;
          const score = abminimax(tempBoard, depth + 1, -player, alpha, beta);
          if (player === 1) {
            if (score[1] > alpha) {
              alpha = score[1];
              move = i;
            }
          } else {
            if (score[1] < beta) {
              beta = score[1];
              move = i;
            }
          }
          tempBoard[i] = 0;
          if (alpha >= beta) break;
        }
      }
      return player === 1 ? [move, alpha] : [move, beta];
    },
    []
  );

  const bestMove = useCallback(() => {
    if (countEmptyBoard(board) === 9) {
      const move = Math.floor(Math.random() * 9);
      const tempBoard = [...board];
      tempBoard[move] = 1;
      setBoard(tempBoard);
      setTurn(-1);
      return;
    }

    const tempBoard = [...board];
    const move = usingAB
      ? abminimax(tempBoard, 0, 1, -Infinity, Infinity)[0]
      : (() => {
          let bestScore = -Infinity;
          let bestMove = 0;
          for (let i = 0; i < tempBoard.length; i++) {
            if (tempBoard[i] === 0) {
              tempBoard[i] = 1;
              const score = minimax(tempBoard, 0, false);
              tempBoard[i] = 0;
              if (score > bestScore) {
                bestScore = score;
                bestMove = i;
              }
            }
          }
          return bestMove;
        })();
    tempBoard[move] = 1;
    setBoard(tempBoard);
    setTurn(-1);
  }, [abminimax, board, minimax, usingAB]);

  useEffect(() => {
    if (playing) {
      const cw = checkWinner(board, true);
      if (cw !== null) {
        setWinner(cw === 1 ? "computer" : "player");
      } else if (!canMove(board)) {
        setPlaying(false);
        setWinner("draw");
      } else if (turn === 1) {
        setTimeout(bestMove, delay);
      }
    }
  }, [turn, board, playing, bestMove]);

  const handleRecord = () => {
    let rrwebHandler = rrweb.record({
      emit(event) {
        setEvents((events: any) => [...events, event]);
      },
    });
    setStopFn(() => rrwebHandler);
  };
  const handleStop = () => {
    if (stopFn) {
      stopFn();
      setStopFn(undefined);
    }
  };

  return (
    <div className="w-full h-screen relative">
      {step === 0 && (
        <Link
          href={"/history"}
          className="size-12 rounded-full hover:cursor-pointer bg-white hover:bg-white/80 absolute top-10 right-10 flex items-center justify-center"
        >
          <History className="stroke-black" />
        </Link>
      )}
      {step == 0 && (
        <div className="flex flex-col w-full h-screen justify-center items-center pt-5">
          <h2 className="font-semibold text-xl mb-4">Choose your symbol</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="px-4 py-4 rounded-lg text-3xl font-medium bg-gray-500/50 hover:bg-gray-500 flex items-center justify-center"
              onClick={() => {
                setSymbols({ "1": "O", "-1": "X" });
                handleNextStep();
                handleRecord();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59L7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12L5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4"
                ></path>
              </svg>
            </button>
            <button
              className="px-4 py-4 rounded-lg text-3xl font-medium bg-gray-500/50 hover:bg-gray-500 flex items-center justify-center"
              onClick={() => {
                setSymbols({ "1": "X", "-1": "O" });
                handleNextStep();
                handleRecord();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      )}
      {step == 1 && (
        <div className="flex flex-col w-full h-screen justify-center items-center pt-5">
          <h2 className="font-semibold text-xl mb-4">Who starts</h2>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              className="px-4 py-2 rounded-lg text-3xl font-medium bg-gray-500/50 hover:bg-gray-500 flex items-center justify-center"
              onClick={() => handleSetStart(1)}
            >
              Computer ({showCell(1)})
            </button>
            <button
              className="px-4 py-2 rounded-lg text-3xl font-medium bg-gray-500/50 hover:bg-gray-500 flex items-center justify-center"
              onClick={() => handleSetStart(-1)}
            >
              Player ({showCell(-1)})
            </button>
          </div>
          <div>
            <button
              className="px-4 py-2 rounded-lg text-xl bg-gray-500/50 hover:bg-gray-500"
              onClick={handlePrevStep}
            >
              Back
            </button>
          </div>
        </div>
      )}
      {step == 2 && (
        <div className="flex flex-col w-full h-screen justify-center items-center pt-5">
          <div>
            {!winner && (
              <h3 className="font-semibold text-lg mb-4 text-center">
                Turn: {turn == 1 ? "Computer" : "Player"}
              </h3>
            )}
            {winner && (
              <h3 className="font-semibold text-lg mb-4 text-center uppercase">
                {winner}
              </h3>
            )}
            <div className="grid grid-cols-3 gap-1">
              {board.map((cell, index) => {
                return (
                  <button
                    className={
                      "px-4 py-4 rounded-lg text-3xl font-medium flex items-center justify-center " +
                      (cell == 0 ? "hover:bg-gray-500" : "cursor-not-allowed") +
                      " " +
                      (winnerLine.includes(index)
                        ? "bg-gray-500"
                        : "bg-gray-500/50")
                    }
                    key={index}
                    onClick={() => {
                      if (cell == 0 && playing && turn == -1) {
                        let newBoard = board.slice();
                        newBoard[index] = -1;
                        setBoard(newBoard);
                        setTurn(1);
                      }
                    }}
                  >
                    {showCell(cell) == "X" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-12 h-12"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59L7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12L5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4"
                        ></path>
                      </svg>
                    ) : showCell(cell) == "O" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-12 h-12"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8"
                        ></path>
                      </svg>
                    ) : (
                      <div className="w-12 h-12"></div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-lg text-3xl font-medium bg-gray-500/50 hover:bg-gray-500 flex items-center justify-center mt-4 mx-auto"
                onClick={handlePrevStep}
              >
                Back
              </button>
              {winner && (
                <button
                  className="px-4 py-2 rounded-lg text-3xl font-medium bg-gray-500/50 hover:bg-gray-500 flex items-center justify-center mt-4 mx-auto"
                  onClick={ async () => {
                    setStep(0);
                    handleStop();
                    setEvents([]);
                  }}
                >
                  Restart
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
