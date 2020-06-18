import { GridCell } from "./models";

export type EntityType = Block | Target | Wall | Gate;

export interface EntityConfig {
  classList?: string[];
  attributes?: { [key: string]: string };
  movable?: boolean;
  border?: boolean;
}

export abstract class Entity {
  elements: HTMLElement[] = [];

  constructor(public cells: GridCell[], public id: number) {}

  createElements(classList: string[]) {
    this.cells.forEach(cell => {
      const element = document.createElement("div");
      element.classList.add(...classList);
      element.style.gridRowStart = cell.row.toString();
      element.style.gridColumnStart = cell.column.toString();
      /* if (this.config?.attributes) {
        Object.entries(this.config.attributes).forEach(([key, value]) => element.setAttribute(key, value));
      } */
      this.elements.push(element);
    });
  }
}

export class Block extends Entity {
  constructor(cells: GridCell[], id: number, public isTarget = false) {
    super(cells, id);
    const classList = ["block"];
    if (isTarget) classList.push("target-block");
    this.createElements(classList);
    this.elements.forEach(element => {
      // element.setAttribute("data-block-id", id.toString());
      // element.setAttribute("entity", "block");
      element.setAttribute("movable", "");
    });
  }
}

export class Target extends Entity {
  constructor(cells: GridCell[], id: number) {
    super(cells, id);
    this.createElements(["target"]);
  }
}

export class Wall extends Entity {
  constructor(cells: GridCell[], id: number) {
    super(cells, id);
    this.createElements(["wall"]);
  }
}

export class Gate extends Entity {
  constructor(cells: GridCell[], id: number) {
    super(cells, id);
    this.createElements(["gate"]);
  }
}
