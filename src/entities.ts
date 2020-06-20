import { GridCell } from "./models";

export type EntityType = Block | Target | Wall | Gate;

export interface EntityConfig {
  classList?: string[];
  attributes?: { [key: string]: string };
  movable?: boolean;
  border?: boolean;
}

export class Entity {
  elements: HTMLElement[] = [];

  constructor(public cells: GridCell[], public id: number) {}

  protected createElements(classList: string[]) {
    for (const cell of this.cells) {
      const element = document.createElement("div");
      element.classList.add("entity", ...classList);
      element.style.gridRowStart = cell.row.toString();
      element.style.gridColumnStart = cell.column.toString();
      element.setAttribute("entity-id", this.id.toString());
      this.elements.push(element);
    }
  }
}

// Mixins
const BorderMixin = (superclass: new (...args: any[]) => Entity) =>
  class extends superclass {
    constructor(...args: any[]) {
      super(...args);
    }

    protected addBorder() {
      for (const element of this.elements) {
        element.classList.add("border-top", "border-bottom", "border-left", "border-right");
        const row = +element.style.gridRowStart;
        const column = +element.style.gridColumnStart;

        for (const cell of this.cells) {
          if (cell.column === column && cell.row === row - 1) element.classList.remove("border-top");
          if (cell.column === column && cell.row === row + 1) element.classList.remove("border-bottom");
          if (cell.row === row && cell.column === column - 1) element.classList.remove("border-left");
          if (cell.row === row && cell.column === column + 1) element.classList.remove("border-right");
        }
      }
    }
  };

const UnlockMixin = (superclass: new (...args: any[]) => Entity) =>
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

export class Block extends BorderMixin(Entity) {
  constructor(cells: GridCell[], id: number, public master = false) {
    super(cells, id);
    const classList = ["block"];
    if (master) classList.push("block--master");
    this.createElements(classList);
    this.addBorder();
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

export class Wall extends BorderMixin(Entity) {
  constructor(cells: GridCell[], id: number) {
    super(cells, id);
    this.createElements(["wall"]);
    this.addBorder();
  }
}

export class Gate extends Entity {
  unlocked = false;

  constructor(cells: GridCell[], id: number) {
    super(cells, id);
    this.createElements(["gate"]);
  }

  unlockElement(cell: GridCell) {
    for (const element of this.elements) {
      if (+element.style.gridRowStart === cell.row && +element.style.gridColumnStart === cell.column) {
        element.classList.add("unlocked");
      }
    }

    if (this.elements.every(element => element.classList.contains("unlocked"))) {
      this.unlocked = true;
      for (const element of this.elements) {
        element.classList.add("openable");
      }
    }
  }

  open() {
    for (const element of this.elements) {
      element.remove();
    }
  }
}
