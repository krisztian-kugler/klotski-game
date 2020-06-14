import { GridCell } from "./models";

// type EntityType = "block" | "wall" | "target";

export abstract class Entity {
  elements: HTMLDivElement[] = [];

  constructor(public cells: GridCell[]) {}

  createElements(classList: string[]) {
    this.cells.forEach(cell => {
      const element = document.createElement("div");
      element.classList.add(...classList);
      element.style.gridRowStart = cell.row.toString();
      element.style.gridColumnStart = cell.column.toString();
      this.elements.push(element);
    });
  }
}

export class Block extends Entity {
  constructor(area: GridCell[], public id: number, private isTarget = false) {
    super(area);
    const classList = ["block"];
    if (isTarget) classList.push("target");
    this.createElements(classList);
    this.elements.forEach(element => {
      element.setAttribute("data-block-id", id.toString());
    });
  }
}

export class TargetBlock extends Block {
  constructor(cells: GridCell[], id: number, isTarget = false) {
    super(cells, id);
  }
}

export class TargetZone extends Entity {
  constructor(public cells: GridCell[]) {
    super(cells);
  }
}

export class Wall extends Entity {
  constructor(area: GridCell[]) {
    super(area);
    this.createElements(["wall"]);
  }
}

export class Gate extends Entity {
  constructor(area: GridCell[]) {
    super(area);
    this.createElements(["gate"]);
  }
}
