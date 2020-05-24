class SudokuModel {
  constructor() {
    this.selected = null;
    this.cells = Array(9);

    for (let row = 0; row < 9; row++) {
      this.cells[row] = Array(9);
      for (let column = 0; column < 9; column++) {
        this.cells[row][column] = {
          selected: false,
          fixed: false,
          value: null,
          centerMarks: Array(9).fill(false),
          cornerMarks: Array(9).fill(false),
        }
      }
    }
  };

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

  clone() {
    let cloned = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );
    cloned.selected = JSON.parse(JSON.stringify(this.selected));
    cloned.cells = JSON.parse(JSON.stringify(this.cells));
    return cloned;
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
    let cell = this.cells[row][column];
    if (!cell.fixed) {
      cell.value = value;
    }
  }

  setValueInSelectedCells(value) {
    if (this.selected) {
      this.setValue(this.selected.row, this.selected.column, value);
    }
  }
}

export default SudokuModel;
