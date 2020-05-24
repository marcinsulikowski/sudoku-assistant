import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Cell extends React.Component {
  render() {
    let getClassName = () => {
      if (this.props.cell.selected) {
        return "cell selected";
      } else {
        return "cell";
      }
    }

    return (
      <div
        className={getClassName()}
        onClick={this.props.onClick}
      >
        {this.props.cell.value}
      </div>
    );
  }
}

class Board extends React.Component {
  renderCell(row, column) {
    return <Cell
      cell={this.props.cells[row][column]}
      onClick={() => this.props.handleClick(row, column)}
    />
  }

  render() {
    let boxes = [];
    for (let boxRow = 0; boxRow < 3; ++boxRow) {
      for (let boxCol = 0; boxCol < 3; ++boxCol) {
        let cells = [];
        for (let cellRow = 0; cellRow < 3; ++cellRow) {
          for (let cellCol = 0; cellCol < 3; ++cellCol) {
            cells.push(this.renderCell(
              3 * boxRow + cellRow,
              3 * boxCol + cellCol
            ));
          }
        }
        boxes.push(<div className="box">{cells}</div>);
      }
    }
    return (<div className="board">{boxes}</div>);
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "big",
      selected: null,
      cells: Array(9),
    };

    for (let row = 0; row < 9; row++) {
      this.state.cells[row] = Array(9);
      for (let column = 0; column < 9; column++) {
        this.state.cells[row][column] = {
          selected: false,
          fixed: false,
          value: null,
          centerMarks: Array(9).fill(false),
          cornerMarks: Array(9).fill(false),
        }
      }
    }
  }

  // Methods which operate on the state

  deselect = (state) => {
    console.log(`deselect()`);
    console.assert(state.selected);
    state.cells[state.selected.row][state.selected.column].selected = false;
    state.selected = null;
  }

  select = (state, row, column) => {
    console.log(`select(row=${row}, column=${column})`);
    console.assert(!state.selected);
    state.cells[row][column].selected = true;
    state.selected = {row: row, column: column}
  }

  setValue = (state, row, column, value) => {
    console.log(`setValue(row=${row}, column=${column}, value=${value})`);
    let cell = state.cells[row][column];
    if (!cell.fixed) {
      cell.value = value;
    }
  }

  // Event handlers

  handleClick = (row, column) => {
    console.log(`handleClick(row=${row}, column=${column})`);
    let state = JSON.parse(JSON.stringify(this.state))
    if (state.selected) {
      this.deselect(state);
    }
    this.select(state, row, column);
    this.setState(state);
  }

  handleKey = (event) => {
    console.log(`handleKey(${event.key})`);
    let state = JSON.parse(JSON.stringify(this.state))
    if (/^[1-9]$/.test(event.key)) {
      if (state.selected && state.mode === "big") {
        let value = event.key.charCodeAt(0) - "0".charCodeAt(0);
        this.setValue(
          state,
          state.selected.row,
          state.selected.column,
          value
        );
      }
    }
    this.setState(state);
  }

  // ReactJS stuff

  componentDidMount() {
    window.addEventListener("keydown", this.handleKey);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKey);
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board
            cells={this.state.cells}
            handleClick={this.handleClick}
          />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
