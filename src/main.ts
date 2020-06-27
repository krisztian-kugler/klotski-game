import "./styles.scss";
import { Board } from "./board";
import {
  oldestGame,
  oldestGame2,
  oldestGame3,
  oldestGame4,
  oldestGame5,
  oldestGame6,
  agatka,
  doggie,
  success,
  bone,
  fortune,
  sunshine,
  fool,
  solomon,
  kleopatra,
  shark,
} from "./set1";

const board = new Board(oldestGame);
const board2 = new Board(sunshine);

board.mount(".board-slot");
board2.mount(".board-slot");
console.log(board);

document.querySelector(".burger-icon").addEventListener("click", function () {
  document.querySelector(".home-screen").classList.toggle("hidden");
});
