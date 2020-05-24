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
      this.cells[this.selected.row][this.selected.column].selected = false;
      this.selected = null;
    }
  }

  select(row, column) {
    console.log(`select(row=${row}, column=${column})`);
    this.deselect();
    this.cells[row][column].selected = true;
    this.selected = { row: row, column: column };
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
