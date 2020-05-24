import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  render() {
    let getClassName = () => {
      if (this.props.square.selected) {
        return "square selected";
      } else {
        return "square";
      }
    }

    return (
      <div
        className={getClassName()}
        onClick={this.props.onClick}
      >
        {this.props.square.value}
      </div>
    );
  }
}

class Board extends React.Component {
  renderSquare(row, column) {
    return <Square
      square={this.props.squares[row][column]}
      onClick={() => this.props.handleClick(row, column)}
    />
  }

  render() {
    let boxes = [];
    for (let boxRow = 0; boxRow < 3; ++boxRow) {
      for (let boxCol = 0; boxCol < 3; ++boxCol) {
        let squares = [];
        for (let squareRow = 0; squareRow < 3; ++squareRow) {
          for (let squareCol = 0; squareCol < 3; ++squareCol) {
            squares.push(this.renderSquare(
              3 * boxRow + squareRow,
              3 * boxCol + squareCol
            ));
          }
        }
        boxes.push(<div className="box">{squares}</div>);
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
      squares: Array(9),
    };

    for (let row = 0; row < 9; row++) {
      this.state.squares[row] = Array(9);
      for (let column = 0; column < 9; column++) {
        this.state.squares[row][column] = {
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
    state.squares[state.selected.row][state.selected.column].selected = false;
    state.selected = null;
  }

  select = (state, row, column) => {
    console.log(`select(row=${row}, column=${column})`);
    console.assert(!state.selected);
    state.squares[row][column].selected = true;
    state.selected = {row: row, column: column}
  }

  setValue = (state, row, column, value) => {
    console.log(`setValue(row=${row}, column=${column}, value=${value})`);
    let square = state.squares[row][column];
    if (!square.fixed) {
      square.value = value;
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
            squares={this.state.squares}
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
