import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      mode: "normal",
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
      if (state.mode === "normal") {
        let number = event.key.charCodeAt(0) - "0".charCodeAt(0);
        state.sudoku.setValueInSelectedCells(number);
      }
    } else if (event.key === "Delete") {
      if (state.mode === "normal") {
        state.sudoku.setValueInSelectedCells(null);
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
    let renderModeButton = (mode) => {
      let text = mode.charAt(0).toUpperCase() + mode.slice(1)
      return (
        <button className="btn btn-outline-dark mode">{text}</button>
      );
    }
    let renderColorButton = (colorId) => {
      return (
        <button className="btn btn-outline-dark color">
          <div class={`sample color${colorId}`}></div>
        </button>
      );
    }

    return (
      <div className="game">
        <Board
          sudoku={this.state.sudoku}
          handleClick={this.handleClick}
        />
        <div className="panel">
          <div className="mode">
            {renderModeButton("normal")}
            {renderModeButton("center")}
            {renderModeButton("corner")}
            {renderColorButton(0)}
            {renderColorButton(1)}
            {renderColorButton(2)}
            {renderColorButton(3)}
            {renderColorButton(4)}
            {renderColorButton(5)}
            {renderColorButton(6)}
            {renderColorButton(7)}
            {renderColorButton(8)}
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
