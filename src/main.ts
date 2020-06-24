import "./styles.scss";
import { Board } from "./board";

const board = new Board({
  rows: 11,
  columns: 10,
  gates: [
    [
      { row: 9, column: 5 },
      { row: 9, column: 6 },
    ],
  ],
  blocks: [
    [
      { column: 4, row: 4 },
      { column: 4, row: 5 },
    ],
    [
      { column: 4, row: 6 },
      { column: 4, row: 7 },
    ],
    [
      { column: 7, row: 4 },
      { column: 7, row: 5 },
    ],
    [
      { column: 7, row: 6 },
      { column: 7, row: 7 },
    ],
    [
      { column: 5, row: 6 },
      { column: 6, row: 6 },
    ],
    [{ column: 5, row: 7 }],
    [{ column: 6, row: 7 }],
    [{ column: 4, row: 8 }],
    [{ column: 7, row: 8 }],
  ],
  masterBlock: [
    { column: 5, row: 4 },
    { column: 6, row: 4 },
    { column: 5, row: 5 },
    { column: 6, row: 5 },
  ],
  target: [
    { column: 9, row: 10 },
    { column: 10, row: 10 },
    { column: 9, row: 11 },
    { column: 10, row: 11 },
  ],
  walls: [
    [
      { column: 3, row: 3 },
      { column: 4, row: 3 },
      { column: 5, row: 3 },
      { column: 6, row: 3 },
      { column: 7, row: 3 },
      { column: 8, row: 3 },
      { column: 3, row: 4 },
      { column: 3, row: 5 },
      { column: 3, row: 6 },
      { column: 3, row: 7 },
      { column: 3, row: 8 },
      { column: 3, row: 9 },
      { column: 4, row: 9 },
      { column: 8, row: 4 },
      { column: 8, row: 5 },
      { column: 8, row: 6 },
      { column: 8, row: 7 },
      { column: 8, row: 8 },
      { column: 8, row: 9 },
      { column: 7, row: 9 },
    ],
  ],
});

board.mount(".board-slot");
console.log(board);

document.querySelector(".menu").addEventListener("click", function () {
  this.classList.toggle("open");
});
