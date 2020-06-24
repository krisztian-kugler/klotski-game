import "./styles.scss";
import { Board } from "./board";
import { oldestGame, oldestGame2, oldestGame3, oldestGame4, oldestGame5, oldestGame6, agatka } from "./set1";

const board = new Board(agatka);

board.mount(".board-slot");
console.log(board);

document.querySelector(".menu").addEventListener("click", function () {
  this.classList.toggle("open");
});
