# Sudoku Assistant

## Sudoku solving techniques implemented in the app

Solving Sudoku puzzles usually involves some pencil-marking techniques. For
example, one such set of possible techniques is:

* If the set of possible values for any given cell is limited, put all the
  possible values as pencil marks in the middle of the cell.
* If the set of positions where a certain value can be placed in any given 3×3
  box is limited, mark the value in the corner of each of these cells.
* Whenever a value is placed, remove all pencil marks with that value from
  cells in the same row, column, and box.
* If there's a cell with a single value left pencil-marked in the middle, or if
  there's only one cell in any given box with the value pencil-marked in the
  corner, put that value in the cell.

Removing these pencil marks and replacing single-digit marks with values is an
automatic and tedious task though, so this app is designed to help with that.
It can not only perform these tasks automatically, but also add new pencil
marks where needed, allowing the user to focus only on the parts which require
more out-of-line thinking. How cool is that? :)

## Controls

* Arrow keys or mouse clicks – Select a cell; multiple cells can be selected
  by clicking with the Control key pressed.
* Space, a, z, x, c – Choose between putting big values, pencil-marking the
  center, pencil-marking the corners, or coloring cells.
* 1–9 – Put the given number as a pencil mark or a value.
* Enter – Color the selected cell (if a color is selected on the right).
* Delete – Delete the value from the cell (if any), pencil marks, or its color.
* Ctrl-z – Undo the last move.
* Ctrl-y – Redo an undone move.

