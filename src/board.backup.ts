/*
private dragMove = (event: MouseEvent) => {
    if (!this.dragging) return;

    const { clientX, clientY } = event;
    const elementBelow = document.elementFromPoint(clientX, clientY) as HTMLDivElement;

    if (!this.activeElement && this.activeBlock.elements.includes(elementBelow)) this.activeElement = elementBelow;

    if (this.activeElement && this.activeElement !== elementBelow) {
      const { top, bottom, left, right } = this.activeElement.getBoundingClientRect();
      if (clientY < top) this.moveHandler("gridRowStart", -1);
      if (clientY > bottom) this.moveHandler("gridRowStart", 1);
      if (clientX < left) this.moveHandler("gridColumnStart", -1);
      if (clientX > right) this.moveHandler("gridColumnStart", 1);
    }
  };

  private dragEnd = () => {
    if (!this.dragging) return;
    this.dragging = false;
    document.body.style.cursor = "default";
    this.updateMatrix(this.activeBlock, true);
    this.activeBlock = this.activeElement = this.refX = this.refY = null;
  };

  private canMove(block: Block | TargetBlock, axis: GridAxis, direction: 1 | -1): boolean {
    return block.elements
      .map(element => ({
        row: toZeroBased(element.style.gridRowStart) + (axis === "gridRowStart" ? direction : 0),
        column: toZeroBased(element.style.gridColumnStart) + (axis === "gridColumnStart" ? direction : 0),
      }))
      .every(
        cell =>
          cell.row >= 0 &&
          cell.row <= this.rows - 1 &&
          cell.column >= 0 &&
          cell.column <= this.columns - 1 &&
          !this.matrix.getValue(cell.row, cell.column)
      );
  }

  private moveBlock(block: Block | TargetBlock, axis: GridAxis, direction: -1 | 1) {
    block.elements.forEach(element => (element.style[axis] = (parseInt(element.style[axis]) + direction).toString()));
  }

  private moveHandler(axis: GridAxis, direction: -1 | 1) {
    this.canMove(this.activeBlock, axis, direction)
      ? this.moveBlock(this.activeBlock, axis, direction)
      : (this.activeElement = null);
  }
*/
