import { GridCell } from "./models";

// type EntityType = "block" | "wall" | "target";
interface EntityConfig {
  classList?: string[];
  attributes?: { [key: string]: string };
}

export abstract class Entity {
  elements: HTMLDivElement[] = [];

  constructor(public cells: GridCell[], private config?: EntityConfig) {
    // this.createElements(config.classList)
  }

  createElements(classList: string[]) {
    this.cells.forEach(cell => {
      const element = document.createElement("div");
      element.classList.add(...classList);
      element.style.gridRowStart = cell.row.toString();
      element.style.gridColumnStart = cell.column.toString();
      if (this.config?.attributes) {
        Object.entries(this.config.attributes).forEach(([key, value]) => element.setAttribute(key, value));
      }
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
      element.setAttribute("entity", "block");
      element.setAttribute("movable", "");
    });
  }
}

export class TargetBlock extends Block {
  constructor(cells: GridCell[], id: number, isTarget = false) {
    super(cells, id);
    this.elements.forEach(element => element.setAttribute("entity", "target-block"));
  }
}

export class TargetZone extends Entity {
  constructor(public cells: GridCell[]) {
    super(cells);
    this.createElements(["target-zone"]);
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
