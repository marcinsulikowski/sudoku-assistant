import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const SudokuModel = require('./SudokuModel').default;

class Cell extends React.Component {
  render() {
    let getClassName = () => {
      let classNames = "cell";
      if (this.props.cell.selected) {
        classNames += " selected";
      }
      if (this.props.cell.incorrect) {
        classNames += " incorrect";
      }
      return classNames;
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
  render() {
    let key = 0;
    let boxes = [];
    for (let boxRow = 0; boxRow < 3; ++boxRow) {
      for (let boxCol = 0; boxCol < 3; ++boxCol) {
        let cells = [];
        for (let cellRow = 0; cellRow < 3; ++cellRow) {
          for (let cellCol = 0; cellCol < 3; ++cellCol) {
            let row = 3 * boxRow + cellRow;
            let column = 3 * boxCol + cellCol;
            cells.push(
              <Cell
                key={++key}
                cell={this.props.sudoku.getCell(row, column)}
                onClick={() => this.props.handleClick(row, column)}
              />
            );
          }
        }
        boxes.push(<div className="box" key={++key}>{cells}</div>);
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
      sudoku: new SudokuModel(),
    };
  }

  // Methods which operate on the state

  cloneState() {
    let state = Object.assign({}, this.state);
    state.sudoku = this.state.sudoku.clone();
    return state;
  }

  // Event handlers

  handleClick = (row, column) => {
    console.log(`handleClick(row=${row}, column=${column})`);
    let state = this.cloneState();
    state.sudoku.select(row, column);
    this.setState(state);
  }

  handleKey = (event) => {
    console.log(`handleKey(${event.key})`);
    let state = this.cloneState();
    if (/^[1-9]$/.test(event.key)) {
      if (state.mode === "big") {
        let number = event.key.charCodeAt(0) - "0".charCodeAt(0);
        state.sudoku.setValueInSelectedCells(number);
      }
    } else if (event.key === "ArrowLeft") {
      state.sudoku.moveSelection(0, -1);
    } else if (event.key === "ArrowRight") {
      state.sudoku.moveSelection(0, +1);
    } else if (event.key === "ArrowUp") {
      state.sudoku.moveSelection(-1, 0);
    } else if (event.key === "ArrowDown") {
      state.sudoku.moveSelection(+1, 0);
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
            sudoku={this.state.sudoku}
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
