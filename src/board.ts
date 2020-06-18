import { BoardConfig, GridCell } from "./models";
import { Entity, Block, Wall, Gate, Target, EntityType } from "./entities";
import { BoardMatrix } from "./board-matrix";
import { validateBoard } from "./validity-checker";
import { toZeroBased } from "./utils";

const unit = 80;

type GridAxis = "gridRowStart" | "gridColumnStart";

export class Board {
  element: HTMLDivElement;
  matrix: BoardMatrix;
  moveCount: number = 0;
  rows: number;
  columns: number;
  targetZone: Target;
  blocks: Block[] = [];
  walls: Wall[] = [];
  gates: Gate[] = [];
  entities: { [key: string]: any } = {};

  private activeBlock: Block;
  private activeElement: Element;
  private _dragging = false;

  set dragging(value: boolean) {
    this._dragging = value;
    document.body.style.cursor = this.dragging ? "pointer" : "default";
  }

  get dragging(): boolean {
    return this._dragging;
  }

  constructor(config: BoardConfig) {
    validateBoard(config);
    this.rows = config.rows;
    this.columns = config.columns;

    this.targetZone = this.createEntity(Target, config.targetZone);
    this.blocks.push(this.createEntity(Block, config.targetBlock, true));
    if (config.blocks) this.blocks.push(...config.blocks.map(cells => this.createEntity(Block, cells)));
    if (config.walls) this.walls = config.walls.map(cells => this.createEntity(Wall, cells));
    if (config.gates) this.gates = config.gates.map(cells => this.createEntity(Gate, cells));

    this.init();

    this.matrix = new BoardMatrix(this.rows, this.columns);
    [...this.blocks, ...this.gates, ...this.walls].forEach(entity => {
      entity.cells.forEach(cell => this.matrix.setValue(cell.row - 1, cell.column - 1, true));
    });
    // TODO: Move matrix initialization to entity creation / board setup phase!
    // upgrade updateMatrix so it can handle an array of entity inputs

    this.element.addEventListener("mousedown", this.dragStart);
    document.addEventListener("mousemove", this.dragMove);
    document.addEventListener("mouseup", this.dragEnd);
  }

  private generateId = (() => {
    let counter = 0;
    return () => counter++;
  })();

  private createEntity(entity: new (...args: any[]) => EntityType, cells: GridCell[], ...args: any[]): any {
    return new entity(cells, this.generateId(), ...args);
  }

  private dragStart = (event: MouseEvent) => {
    event.preventDefault();
    const element = event.target as HTMLElement;
    if (element.hasAttribute("movable")) {
      this.dragging = true;
      this.activeElement = element;
      this.activeBlock = this.getBlock(element);
      this.updateMatrix(this.activeBlock, false);
    }
  };

  private dragMove = (event: MouseEvent) => {
    if (!this.dragging) return;

    const { clientX, clientY } = event;
    const elementBelow = document.elementFromPoint(clientX, clientY) as HTMLElement;

    if (!this.activeElement && this.activeBlock.elements.includes(elementBelow)) this.activeElement = elementBelow;

    if (this.activeElement && this.activeElement !== elementBelow) {
      const { top, bottom, left, right } = this.activeElement.getBoundingClientRect();

      if (clientY < top) this.moveHandler(elementBelow, "gridRowStart", -1);
      if (clientY > bottom) this.moveHandler(elementBelow, "gridRowStart", 1);
      if (clientX < left) this.moveHandler(elementBelow, "gridColumnStart", -1);
      if (clientX > right) this.moveHandler(elementBelow, "gridColumnStart", 1);
    }
  };

  private dragEnd = () => {
    if (!this.dragging) return;
    this.dragging = false;
    this.updateMatrix(this.activeBlock, true);
    this.activeBlock = this.activeElement = null;
  };

  private canMove(block: Block, axis: GridAxis, direction: 1 | -1): boolean {
    return block.elements
      .map(
        element =>
          ({
            row: toZeroBased(element.style.gridRowStart) + (axis === "gridRowStart" ? direction : 0),
            column: toZeroBased(element.style.gridColumnStart) + (axis === "gridColumnStart" ? direction : 0),
          } as GridCell)
      )
      .every(
        cell =>
          cell.row >= 0 &&
          cell.row <= this.rows - 1 &&
          cell.column >= 0 &&
          cell.column <= this.columns - 1 &&
          !this.matrix.getValue(cell.row, cell.column)
      );
  }

  private moveBlock(block: Block, axis: GridAxis, direction: -1 | 1) {
    block.elements.forEach(element => (element.style[axis] = (parseInt(element.style[axis]) + direction).toString()));
  }

  private moveHandler(elementBelow: HTMLElement, axis: GridAxis, direction: -1 | 1) {
    if (this.canMove(this.activeBlock, axis, direction)) {
      this.moveBlock(this.activeBlock, axis, direction);
    } else if (this.activeBlock.elements.includes(elementBelow)) {
      this.activeElement = elementBelow;
    } else {
      this.activeElement = null;
    }
  }

  private updateMatrix(block: Block, value: boolean) {
    block.elements.forEach(element => {
      const row = toZeroBased(element.style.gridRowStart);
      const column = toZeroBased(element.style.gridColumnStart);
      this.matrix.setValue(row, column, value);
    });
  }

  private init() {
    this.setBoard();
    this.setWalls();
    this.setBlocks();
    this.setGates();
  }

  private renderEntities(...entities: Entity[]) {}

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

  private getBlock(element: HTMLElement): Block {
    for (const block of this.blocks) {
      if (block.elements.includes(element)) return block;
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
    this.matrix.reset();
    this.setBlocks();
    this.moveCount = 0;
  }

  destroy() {
    this.element.removeEventListener("mousedown", this.dragStart);
    document.removeEventListener("mousemove", this.dragMove);
    document.removeEventListener("mouseup", this.dragEnd);
  }
}
