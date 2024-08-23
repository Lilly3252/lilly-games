import { readFileSync } from "node:fs";
import { BoardSpace } from "./classes/boardSpace";
import { MonopolyGame } from "./classes/monopoly";
export const boardData: BoardSpace[] = JSON.parse(readFileSync('board.json', 'utf-8'));
export const game = new MonopolyGame([], boardData);