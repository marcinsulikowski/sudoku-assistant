function bitmaskCount(valueBitmask) {
  let trueCount = 0;
  for (let value = 1; value <= 9; ++value) {
    if (valueBitmask[value]) {
      trueCount++;
    }
  }
  return trueCount;
}


function bitmaskAndInPlace(valueBitmask1, valueBitmask2) {
  for (let value = 1; value <= 9; ++value) {
    valueBitmask1[value] = (valueBitmask1[value] && valueBitmask2[value]);
  }
}


function bitmaskOrInPlace(valueBitmask1, valueBitmask2) {
  for (let value = 1; value <= 9; ++value) {
    valueBitmask1[value] = (valueBitmask1[value] || valueBitmask2[value]);
  }
}


class SudokuModel {
  constructor() {
    this.selected = null;
    this.cells = Array(9);

    for (let row = 0; row < 9; row++) {
      this.cells[row] = Array(9);
      for (let column = 0; column < 9; column++) {
        this.cells[row][column] = {
          row: row,
          column: column,
          index: row * 9 + column,
          selected: false,
          incorrect: false,
          fixed: false,
          value: null,
          color: null,
          centerMarks: Array(10).fill(false),
          cornerMarks: Array(10).fill(false),
          possibleValues: Array(10).fill(false),
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

  savePuzzle() {
    let values = Array(9 * 9).fill(0);
    for (const cell of this.getAllCells()) {
      values[cell.index] = (cell.value === null ? 0 : cell.value);
    }
    return values.join("");
  }

  loadPuzzle(puzzle) {
    for (const cell of this.getAllCells()) {
      let value = puzzle.charCodeAt(cell.index) - "0".charCodeAt(0);
      cell.value = (value === 0 ? null : value);
      cell.color = null;
      cell.fixed = (cell.value !== null);
      cell.cornerMarks.fill(false);
      cell.centerMarks.fill(false);
    }
    this.onValueChange();
  }

  getCell(row, column) {
    return this.cells[row][column];
  }

  getSelectedCells() {
    if (this.selected) {
      return [this.cells[this.selected.row][this.selected.column]];
    } else {
      return [];
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

  getAllBoxes() {
    let boxes = [];
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxColumn = 0; boxColumn < 3; boxColumn++) {
        boxes.push(this.getBoxCells(boxRow, boxColumn));
      }
    }
    return boxes;
  }

  getAllRegions() {
    let regions = this.getAllBoxes();
    for (let row = 0; row < 9; row++) {
      regions.push(this.getRowCells(row));
    }
    for (let column = 0; column < 9; column++) {
      regions.push(this.getColumnCells(column));
    }
    return regions;
  }

  deselect() {
    console.log(`deselect()`);
    for (const cell of this.getSelectedCells()) {
      cell.selected = false;
    }
    this.selected = null;
  }

  select(row, column) {
    console.log(`select(row=${row}, column=${column})`);
    this.deselect();
    this.selected = { row: row, column: column };
    for (const cell of this.getSelectedCells()) {
      cell.selected = true;
    }
  }

  moveSelection(rowDiff, columnDiff) {
    console.log(`moveSelection(row=${rowDiff}, column=${columnDiff})`);
    if (this.selected) {
      for (const cell of this.getSelectedCells()) {
        cell.selected = false;
      }
      this.selected.row = Math.max(
        0,
        Math.min(8, this.selected.row + rowDiff)
      );
      this.selected.column = Math.max(
        0,
        Math.min(8, this.selected.column + columnDiff)
      );
      for (const cell of this.getSelectedCells()) {
        cell.selected = true;
      }
    }
  }

  setValueInSelectedCells(value) {
    for (const cell of this.getSelectedCells()) {
      if (!cell.fixed) {
        cell.value = value;
      }
    }
    this.onValueChange();
  }

  clearValueInSelectedCells() {
    for (const cell of this.getSelectedCells()) {
      if (cell.value === null) {
        cell.centerMarks.fill(false);
        cell.cornerMarks.fill(false);
      } else if (!cell.fixed) {
        cell.value = null;
        this.onValueChange();
      }
    }
  }

  toggleCenterInSelectedCells(value) {
    for (const cell of this.getSelectedCells()) {
      if (cell.value === null) {
        cell.centerMarks[value] = !cell.centerMarks[value];
      }
    }
  }

  toggleCornerInSelectedCells(value) {
    for (const cell of this.getSelectedCells()) {
      if (cell.value === null) {
        cell.cornerMarks[value] = !cell.cornerMarks[value];
      }
    }
  }

  setColorInSelectedCells(color) {
    for (const cell of this.getSelectedCells()) {
      cell.color = color;
    }
  }

  onValueChange() {
    do {
      if (this.updateIncorrect()) {
        return;
      }
      this.updatePossibleValues();
      this.clearImpossibleMarks();
      this.autofillCenterMarks();
      this.autofillCornerMarks();
    } while (this.autofillSingleValues());
  }

  updateIncorrect() {
    for (const cell of this.getAllCells()) {
      cell.incorrect = false;
    }

    let hasIncorrectCells = false;
    for (const region of this.getAllRegions()) {
      let counts = Array(10).fill(0);
      for (const cell of region) {
        if (cell.value !== null) {
          counts[cell.value]++;
        }
      }
      for (const cell of region) {
        if (cell.value !== null && counts[cell.value] > 1) {
          cell.incorrect = true;
          hasIncorrectCells = true;
        }
      }
    }
    return hasIncorrectCells;
  }

  updatePossibleValues() {
    for (const cell of this.getAllCells()) {
      cell.possibleValues = Array(10).fill(true);
      cell.possibleValues[0] = false;  // 0 is not a valid value
    }
    for (const region of this.getAllRegions()) {
      let possibleInRegion = Array(10).fill(true);
      for (const cell of region) {
        if (cell.value !== null) {
          possibleInRegion[cell.value] = false;
        }
      }
      for (const cell of region) {
        bitmaskAndInPlace(cell.possibleValues, possibleInRegion);
      }
    }
  }

  clearImpossibleMarks() {
    for (const cell of this.getAllCells()) {
      bitmaskAndInPlace(cell.centerMarks, cell.possibleValues);
      bitmaskAndInPlace(cell.cornerMarks, cell.possibleValues);
    }
  }

  autofillCenterMarks() {
    for (const cell of this.getAllCells()) {
      if (cell.value === null
          && bitmaskCount(cell.centerMarks) === 0
          && bitmaskCount(cell.possibleValues) <= 3) {
        cell.centerMarks = cell.possibleValues.slice();
      }
    }
  }

  autofillCornerMarks() {
    for (const box of this.getAllBoxes()) {
      // Find out which values are not marked yet in any corner of the
      // box and in how many cells of the box can each value go.
      let alreadyMarkedValues = Array(10).fill(false);
      let possibleCellsForValue = Array(10).fill(0);
      for (const cell of box) {
        if (cell.value === null) {
          bitmaskOrInPlace(alreadyMarkedValues, cell.cornerMarks);
          for (let value = 1; value <= 9; ++value) {
            if (cell.possibleValues[value]) {
              possibleCellsForValue[value] += 1;
            }
          }
        }
      }

      for (let value = 1; value <= 9; ++value) {
        if (alreadyMarkedValues[value]
            || possibleCellsForValue[value] === 0
            || possibleCellsForValue[value] > 2) {
          // This value does not need adding corner marks.
          continue;
        }
        for (const cell of box) {
          if (cell.value === null && cell.possibleValues[value]) {
            cell.cornerMarks[value] = true;
          }
        }
      }
    }
  }

  autofillSingleValues() {
    let changed = false;
    for (const cell of this.getAllCells()) {
      if (cell.value === null && bitmaskCount(cell.possibleValues) === 1) {
        cell.value = cell.possibleValues.indexOf(true);
        changed = true;
      }
    }

    for (const region of this.getAllBoxes()) {
      // Find values which can go to single cell only in the given region.
      let possibleCellsForValue = Array(10).fill(0);
      let alreadyFilledValues = Array(10).fill(false);
      let targetCells = Array(10).fill(null);
      for (const cell of region) {
        if (cell.value !== null) {
          alreadyFilledValues[cell.value] = true;
        } else {
          for (let value = 1; value <= 9; ++value) {
            if (cell.possibleValues[value]) {
              if (++possibleCellsForValue[value] === 1) {
                targetCells[value] = cell;
              } else {
                targetCells[value] = null;
              }
            }
          }
        }
      }
      // Fill cells which are the only candidates for the given value.
      for (let value = 1; value <= 9; ++value) {
        if (!alreadyFilledValues[value] && targetCells[value] !== null) {
          targetCells[value].value = value;
          changed = true;
        }
      }
    }
    return changed;
  }
}

export default SudokuModel;
