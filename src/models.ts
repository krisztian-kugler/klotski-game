export interface GridCell {
  row: number;
  column: number;
}

export interface BoardConfig {
  rows: number;
  columns: number;
  targetBlock: GridCell[];
  targetZone: GridCell[];
  blocks?: GridCell[][];
  walls?: GridCell[][];
  gates?: GridCell[][];
}
