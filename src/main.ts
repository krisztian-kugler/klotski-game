import { Board } from "./board";

const board = new Board({
  columns: 10,
  rows: 11,
  gates: [
    [
      { row: 9, column: 5 },
      { column: 6, row: 9 },
    ],
  ],
  blocks: [
    [
      { column: 1, row: 1 },
      { column: 1, row: 2 },
      { column: 2, row: 2 },
    ],
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
  targetBlock: [
    { column: 5, row: 4 },
    { column: 6, row: 4 },
    { column: 5, row: 5 },
    { column: 6, row: 5 },
  ],
  targetZone: [
    { column: 9, row: 10 },
    { column: 10, row: 10 },
    { column: 9, row: 11 },
    { column: 9, row: 11 },
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

board.mount(".main");
console.log(board);
