export interface GridCell {
  row: number;
  column: number;
}

export interface BoardConfig {
  rows: number;
  columns: number;
  target: GridCell[];
  masterBlock: GridCell[];
  blocks?: GridCell[][];
  walls?: GridCell[][];
  gates?: GridCell[][];
}
