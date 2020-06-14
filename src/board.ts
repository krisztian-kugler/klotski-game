import { BoardConfig } from "./models";
import { Entity, Block, Wall, Gate, TargetBlock, TargetZone } from "./entities";
import { BoardMatrix } from "./board-matrix";
import { validityChecker } from "./validity-checker";
import { toZeroBased } from "./utils";

const unit = 80;

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
  currentX: number;
  currentY: number;
  dragging = false;

  private activeElement: HTMLDivElement;
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

    this.element.addEventListener("pointerdown", this.onMouseDown);
    this.element.addEventListener("pointermove", this.onMouseMove);
    this.element.addEventListener("pointerup", this.onMouseUp);
  }

  private onMouseDown = (event: MouseEvent) => {
    event.preventDefault(); // Needed, because mouseup won't allways fire if the mousedown handler is processing.
    console.log("mouse down");
    const element = event.target as HTMLElement;
    if (element.classList.contains("block")) {
      this.dragging = true;
      this.currentX = event.clientX;
      this.currentY = event.clientY;
      this.activeElement = element as HTMLDivElement;
      this.activeBlock = this.getBlock(element);
      console.log(this.activeBlock);
      this.activeBlock.elements.forEach(e => {
        const row = toZeroBased(e.style.gridRowStart);
        const column = toZeroBased(e.style.gridColumnStart);
        this.coverageMatrix[row][column] = false;
      });
    }
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.dragging) return;

    if (this.activeBlock.elements.includes(document.elementFromPoint(event.clientX, event.clientY) as HTMLDivElement)) {
      this.activeElement = event.target as HTMLDivElement;
    }

    const clientRect = this.activeElement.getBoundingClientRect();

    if (
      Math.abs(this.currentX - event.clientX) > unit ||
      (document.elementFromPoint(event.clientX, event.clientY) !== this.activeElement &&
        event.clientY > clientRect.top &&
        event.clientY < clientRect.bottom)
    ) {
      if (event.clientX > this.currentX) {
        const canMove = this.canMove(this.activeBlock, "gridColumnStart", 1);
        if (canMove) {
          this.changeGridPosition(this.activeBlock.elements, "gridColumnStart", 1);
          this.setCurrentValues(event);
        } else {
          this.dragging = false;
          this.activeBlock.elements.forEach(element => {
            const row = toZeroBased(element.style.gridRowStart);
            const column = toZeroBased(element.style.gridColumnStart);
            this.coverageMatrix[row][column] = true;
          });
        }
      }
      if (event.clientX < this.currentX) {
        const canMove = this.canMove(this.activeBlock, "gridColumnStart", -1);
        if (canMove) {
          this.changeGridPosition(this.activeBlock.elements, "gridColumnStart", -1);
          this.setCurrentValues(event);
        } else {
          this.dragging = false;
          this.activeBlock.elements.forEach(element => {
            const row = toZeroBased(element.style.gridRowStart);
            const column = toZeroBased(element.style.gridColumnStart);
            this.coverageMatrix[row][column] = true;
          });
        }
      }
    }

    if (
      Math.abs(this.currentY - event.clientY) > unit ||
      (document.elementFromPoint(event.clientX, event.clientY) !== this.activeElement &&
        event.clientX > clientRect.left &&
        event.clientX < clientRect.right)
    ) {
      if (event.clientY > this.currentY) {
        const canMove = this.canMove(this.activeBlock, "gridRowStart", 1);
        if (canMove) {
          this.changeGridPosition(this.activeBlock.elements, "gridRowStart", 1);
          this.setCurrentValues(event);
        } else {
          this.dragging = false;
          this.activeBlock.elements.forEach(element => {
            const row = toZeroBased(element.style.gridRowStart);
            const column = toZeroBased(element.style.gridColumnStart);
            this.coverageMatrix[row][column] = true;
          });
        }
      }
      if (event.clientY < this.currentY) {
        const canMove = this.canMove(this.activeBlock, "gridRowStart", -1);
        if (canMove) {
          this.changeGridPosition(this.activeBlock.elements, "gridRowStart", -1);
          this.setCurrentValues(event);
        } else {
          this.dragging = false;
          this.activeBlock.elements.forEach(element => {
            const row = toZeroBased(element.style.gridRowStart);
            const column = toZeroBased(element.style.gridColumnStart);
            this.coverageMatrix[row][column] = true;
          });
        }
      }
    }
  };

  private canMove(block: Block, axis: "gridColumnStart" | "gridRowStart", direction: -1 | 1): boolean {
    const newPositions = block.elements.map(element => ({
      col: parseInt(element.style.gridColumnStart) + (axis === "gridColumnStart" ? direction : 0) - 1,
      row: parseInt(element.style.gridRowStart) + (axis === "gridRowStart" ? direction : 0) - 1,
    }));
    console.log(newPositions);

    const canMove = newPositions.every(pos => {
      return (
        !this.coverageMatrix[pos.row][pos.col] &&
        pos.row >= 0 &&
        pos.row <= this.rows - 1 &&
        pos.col >= 0 &&
        pos.col <= this.columns - 1
      );
    });

    console.log(canMove);
    return canMove;
  }

  private changeGridPosition(elements: HTMLElement[], axis: "gridColumnStart" | "gridRowStart", direction: -1 | 1) {
    elements.forEach(element => (element.style[axis] = (parseInt(element.style[axis]) + direction).toString()));
  }

  private setCurrentValues(event: MouseEvent) {
    this.currentX = event.clientX;
    this.currentY = event.clientY;
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

        console.log(col, row, left, right, top, bottom);

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

        console.log(col, row, left, right, top, bottom);

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
    console.log(unit);
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
    this.element.removeEventListener("mousemove", this.onMouseMove);
    this.element.removeEventListener("mouseup", this.onMouseUp);
  }
}
