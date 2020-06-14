import { BoardConfig, GridCell } from "./models";
import { Entity, Block, Wall, Gate, TargetBlock, TargetZone } from "./entities";
import { BoardMatrix } from "./board-matrix";
import { validityChecker } from "./validity-checker";
import { toZeroBased } from "./utils";

const unit = 80;

type GridAxis = "gridRowStart" | "gridColumnStart";

export class Board {
  element: HTMLDivElement;
  coverageMatrix: boolean[][] = [];
  matrix: BoardMatrix;
  moveCount: number = 0;
  rows: number;
  columns: number;
  targetBlock: TargetBlock;
  targetZone: TargetZone;
  blocks: Block[];
  walls: Wall[];
  gates: Gate[];
  refX: number;
  refY: number;
  dragging = false;

  private activeElement: Element;
  private activeBlock: Block | TargetBlock;

  constructor(config: BoardConfig) {
    validityChecker(config);
    this.rows = config.rows;
    this.columns = config.columns;
    this.matrix = new BoardMatrix(this.rows, this.columns);

    this.setCoverageMatrix();

    this.gates = config.gates.map(gate => {
      this.matrix.setValues(gate, true);
      gate.forEach(cell => {
        this.matrix.setValue(cell.row, cell.column, true);
        this.coverageMatrix[cell.row - 1][cell.column - 1] = true;
      });
      return new Gate(gate);
    });

    this.blocks = [config.targetBlock, ...config.blocks].map((block, index) => {
      block.forEach(item => (this.coverageMatrix[item.row - 1][item.column - 1] = true));
      return new Block(block, index, !index);
    });

    this.walls = config.walls
      ? config.walls.map(wall => {
          wall.forEach(item => (this.coverageMatrix[item.row - 1][item.column - 1] = true));
          return new Wall(wall);
        })
      : [];

    this.init();

    this.element.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  private onMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    const element = event.target as HTMLDivElement;
    if (element.hasAttribute("movable")) {
      this.dragging = true;
      this.setReferenceValues(event);
      this.activeElement = element;
      this.activeBlock = this.getBlock(element);
      this.activeBlock.elements.forEach(e => {
        const row = toZeroBased(e.style.gridRowStart);
        const column = toZeroBased(e.style.gridColumnStart);
        this.coverageMatrix[row][column] = false;
      });
    }
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.dragging) return;

    const { clientX, clientY } = event;
    const { top, bottom, left, right } = this.activeElement.getBoundingClientRect();
    const elementBelow = document.elementFromPoint(clientX, clientY) as HTMLDivElement;

    if (elementBelow !== this.activeElement && clientY > Math.ceil(top) && clientY < Math.floor(bottom)) {
      if (clientX > this.refX) this.moveHandler(event, elementBelow, "gridColumnStart", 1);
      if (clientX < this.refX) this.moveHandler(event, elementBelow, "gridColumnStart", -1);
    }

    if (elementBelow !== this.activeElement && clientX > Math.ceil(left) && clientX < Math.floor(right)) {
      if (clientY > this.refY) this.moveHandler(event, elementBelow, "gridRowStart", 1);
      if (clientY < this.refY) this.moveHandler(event, elementBelow, "gridRowStart", -1);
    }
  };

  private canMove(block: Block | TargetBlock, axis: GridAxis, direction: 1 | -1): boolean {
    const targetCells: GridCell[] = block.elements.map(element => ({
      row: toZeroBased(element.style.gridRowStart) + (axis === "gridRowStart" ? direction : 0),
      column: toZeroBased(element.style.gridColumnStart) + (axis === "gridColumnStart" ? direction : 0),
    }));
    console.log(targetCells);

    const canMove = targetCells.every(cell => {
      return (
        cell.row >= 0 &&
        cell.row <= this.rows - 1 &&
        cell.column >= 0 &&
        cell.column <= this.columns - 1 &&
        !this.coverageMatrix[cell.row][cell.column]
      );
    });

    return canMove;
  }

  private moveBlock(block: Block | TargetBlock, axis: GridAxis, direction: -1 | 1) {
    block.elements.forEach(element => (element.style[axis] = (parseInt(element.style[axis]) + direction).toString()));
  }

  private moveHandler(event: MouseEvent, elementBelow: HTMLDivElement, axis: GridAxis, direction: -1 | 1) {
    if (this.canMove(this.activeBlock, axis, direction)) {
      this.moveBlock(this.activeBlock, axis, direction);
      this.setReferenceValues(event);
    } else if (this.activeBlock.elements.includes(elementBelow)) {
      this.activeElement = elementBelow;
      this.setReferenceValues(event);
    } else {
      this.dragging = false;
      this.activeBlock.elements.forEach(element => {
        const row = toZeroBased(element.style.gridRowStart);
        const column = toZeroBased(element.style.gridColumnStart);
        this.coverageMatrix[row][column] = true;
      });
    }
  }

  private setReferenceValues(event: MouseEvent) {
    this.refX = event.clientX;
    this.refY = event.clientY;
  }

  private onMouseUp = () => {
    if (this.dragging) {
      this.dragging = false;
      this.updateCoverage(this.activeBlock, true);
      this.activeBlock = this.activeElement = null;
    }
  };

  private updateCoverage(block: Block, value: boolean) {
    block.elements.forEach(element => {
      const row = parseInt(element.style.gridRowStart) - 1;
      const col = parseInt(element.style.gridColumnStart) - 1;
      this.coverageMatrix[row][col] = value;
    });
  }

  private init() {
    this.setBoard();
    this.setWalls();
    this.setBlocks();
    this.setGates();
  }

  private setBlocks() {
    this.blocks.forEach(block => {
      block.elements.forEach(element => {
        element.classList.add("border-top", "border-bottom", "border-left", "border-right");
        const col = +element.style.gridColumnStart;
        const row = +element.style.gridRowStart;
        const left = +element.style.gridColumnStart - 1;
        const right = +element.style.gridColumnStart + 1;
        const top = +element.style.gridRowStart - 1;
        const bottom = +element.style.gridRowStart + 1;

        block.cells.forEach(position => {
          if (position.column === col && position.row === top) {
            element.classList.remove("border-top");
          }

          if (position.column === col && position.row === bottom) {
            element.classList.remove("border-bottom");
          }

          if (position.column === left && position.row === row) {
            element.classList.remove("border-left");
          }

          if (position.column === right && position.row === row) {
            element.classList.remove("border-right");
          }
        });
        this.element.append(element);
      });
    });
  }

  private addBorders(items: Entity[]) {}

  private setWalls() {
    this.addBorders(this.walls);
    this.walls.forEach(wall => {
      wall.elements.forEach(element => {
        element.classList.add("border-top", "border-bottom", "border-left", "border-right");
        const col = +element.style.gridColumnStart;
        const row = +element.style.gridRowStart;
        const left = +element.style.gridColumnStart - 1;
        const right = +element.style.gridColumnStart + 1;
        const top = +element.style.gridRowStart - 1;
        const bottom = +element.style.gridRowStart + 1;

        wall.cells.forEach(position => {
          if (position.column === col && position.row === top) {
            element.classList.remove("border-top");
          }

          if (position.column === col && position.row === bottom) {
            element.classList.remove("border-bottom");
          }

          if (position.column === left && position.row === row) {
            element.classList.remove("border-left");
          }

          if (position.column === right && position.row === row) {
            element.classList.remove("border-right");
          }
        });

        this.element.append(element);
      });
    });
  }

  private setGates() {
    this.gates.forEach(gate => {
      gate.elements.forEach(element => {
        element.classList.add("border-top", "border-bottom", "border-left", "border-right");
        const col = +element.style.gridColumnStart;
        const row = +element.style.gridRowStart;
        const left = +element.style.gridColumnStart - 1;
        const right = +element.style.gridColumnStart + 1;
        const top = +element.style.gridRowStart - 1;
        const bottom = +element.style.gridRowStart + 1;

        gate.cells.forEach(position => {
          if (position.column === col && position.row === top) {
            element.classList.remove("border-top");
          }

          if (position.column === col && position.row === bottom) {
            element.classList.remove("border-bottom");
          }

          if (position.column === left && position.row === row) {
            element.classList.remove("border-left");
          }

          if (position.column === right && position.row === row) {
            element.classList.remove("border-right");
          }
        });

        this.element.append(element);
      });
    });
  }

  private setBoard() {
    this.element = document.createElement("div");
    this.element.classList.add("board");
    this.element.style.gridTemplate = `repeat(${this.rows}, ${unit}px) / repeat(${this.columns}, ${unit}px)`;
  }

  private setCoverageMatrix() {
    this.coverageMatrix = Array(this.rows)
      .fill([])
      .map(_ => Array(this.columns).fill(false));
  }

  private getBlock(element: HTMLElement): Block {
    for (const block of this.blocks) {
      if (block.id === +element.dataset.blockId) return block;
    }
  }

  mount(selector: string) {
    const host = document.querySelector(selector);
    if (host) {
      host.append(this.element);
    } else {
      throw new Error(`Board cannot be mounted on '${selector}'. Element doesn't exist.`);
    }
  }

  reset() {
    this.setCoverageMatrix();
    this.setBlocks();
    this.moveCount = 0;
  }

  destroy() {
    this.element.removeEventListener("mousedown", this.onMouseDown);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }
}
