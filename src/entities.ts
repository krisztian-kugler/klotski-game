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

  protected createElements(classList: string[]) {
    for (const cell of this.cells) {
      const element = document.createElement("div");
      element.classList.add(...classList);
      element.style.gridRowStart = cell.row.toString();
      element.style.gridColumnStart = cell.column.toString();
      element.setAttribute("entity-id", this.id.toString());
      this.elements.push(element);
    }
  }
}

// Mixins
const BorderMixin = (superclass: new (...args: any[]) => any) =>
  class extends superclass {
    constructor(...args: any[]) {
      super(...args);
    }

    protected addBorder() {}
  };

const UnlockMixin = (superclass: new (...args: any[]) => any) =>
  class extends superclass {
    constructor(...args: any[]) {
      super(...args);
    }

    protected unlock() {
      this.elements.forEach((element: HTMLElement) => {
        element.classList.add("unlocked");
      });
    }
  };

export class Block extends Entity {
  constructor(cells: GridCell[], id: number, public isTarget = false) {
    super(cells, id);
    const classList = ["block"];
    if (isTarget) classList.push("target-block");
    this.createElements(classList);
    this.elements.forEach(element => {
      element.setAttribute("draggable", "");
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
