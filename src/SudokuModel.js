class SudokuModel {
  constructor() {
    this.selected = null;
    this.cells = Array(9);

    for (let row = 0; row < 9; row++) {
      this.cells[row] = Array(9);
      for (let column = 0; column < 9; column++) {
        this.cells[row][column] = {
          selected: false,
          incorrect: false,
          fixed: false,
          value: null,
          color: null,
          centerMarks: Array(9).fill(false),
          cornerMarks: Array(9).fill(false),
        }
      }
    }
  }

  clone() {
    let cloned = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );
    cloned.selected = JSON.parse(JSON.stringify(this.selected));
    cloned.cells = JSON.parse(JSON.stringify(this.cells));
    return cloned;
  }


  getCell(row, column) {
    return this.cells[row][column];
  }

  getSelectedCell() {
    if (this.selected) {
      return this.cells[this.selected.row][this.selected.column];
    } else {
      return null;
    }
  }

  getAllCells() {
    let cells = [];
    for (let row = 0; row < 9; ++row) {
      cells = cells.concat(this.cells[row]);
    }
    return cells;
  }

  getRowCells(row) {
    return this.cells[row];
  }

  getColumnCells(column) {
    let cells = [];
    for (let row = 0; row < 9; ++row) {
      cells.push(this.cells[row][column]);
    }
    return cells;
  }

  getBoxCells(boxRow, boxColumn) {
    let cells = [];
    for (let rowInBox = 0; rowInBox < 3; ++rowInBox) {
      for (let columnInBox = 0; columnInBox < 3; ++columnInBox) {
        let row = 3 * boxRow + rowInBox;
        let column = 3 * boxColumn + columnInBox;
        cells.push(this.cells[row][column]);
      }
    }
    return cells;
  }

  getAllRegions() {
    let regions = [];
    for (let row = 0; row < 9; row++) {
      regions.push(this.getRowCells(row));
    }
    for (let column = 0; column < 9; column++) {
      regions.push(this.getColumnCells(column));
    }
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxColumn = 0; boxColumn < 3; boxColumn++) {
        regions.push(this.getBoxCells(boxRow, boxColumn));
      }
    }
    return regions;
  }

  deselect() {
    console.log(`deselect()`);
    if (this.selected) {
      this.getSelectedCell().selected = false;
      this.selected = null;
    }
  }

  select(row, column) {
    console.log(`select(row=${row}, column=${column})`);
    this.deselect();
    this.selected = { row: row, column: column };
    this.getSelectedCell().selected = true;
  }

  moveSelection(rowDiff, columnDiff) {
    console.log(`moveSelection(row=${rowDiff}, column=${columnDiff})`);
    if (this.selected) {
      this.getSelectedCell().selected = false;
      this.selected.row = Math.max(
        0,
        Math.min(8, this.selected.row + rowDiff)
      );
      this.selected.column = Math.max(
        0,
        Math.min(8, this.selected.column + columnDiff)
      );
      this.getSelectedCell().selected = true;
    }
  }

  setValue(row, column, value) {
    console.log(`setValue(row=${row}, column=${column}, value=${value})`);
    let cell = this.getCell(row, column);
    if (!cell.fixed) {
      cell.value = value;
    }
    this.updateInvalid();
  }

  setColor(row, column, color) {
    console.log(`setColor(row=${row}, column=${column}, color=${color})`);
    this.getCell(row, column).color = color;
  }

  setValueInSelectedCells(value) {
    if (this.selected) {
      this.setValue(this.selected.row, this.selected.column, value);
    }
  }

  setColorInSelectedCells(color) {
    if (this.selected) {
      this.setColor(this.selected.row, this.selected.column, color);
    }
  }

  updateInvalid() {
    for (const cell of this.getAllCells()) {
      cell.incorrect = false;
    }
    for (const region of this.getAllRegions()) {
      this.markDuplicatesAsInvalid(region);
    }
  }

  markDuplicatesAsInvalid(region) {
    let counts = Array(10).fill(0);
    for (const cell of region) {
      if (cell.value !== null) {
        counts[cell.value]++;
      }
    }
    for (const cell of region) {
      if (cell.value !== null && counts[cell.value] > 1) {
        cell.incorrect = true;
      }
    }
  }
}

export default SudokuModel;
