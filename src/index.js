import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const SudokuModel = require('./SudokuModel').default;

class Cell extends React.Component {
  render() {
    let getClassName = () => {
      let classNames = "cell";
      if (this.props.cell.color !== null) {
        classNames += ` color${this.props.cell.color}`;
      }
      if (!this.props.cell.fixed) {
        classNames += " variable";
      }
      if (this.props.cell.selected) {
        classNames += " selected";
      }
      if (this.props.cell.incorrect) {
        classNames += " incorrect";
      }
      if (this.props.cell.value !== null) {
        classNames += " disable-pencil-marks"
      }
      return classNames;
    }

    let cornerMarks = Array(6).fill("");
    let cornerIndex = 0;
    for (let value = 1; value <= 9; ++value) {
      if (this.props.cell.cornerMarks[value]) {
        cornerMarks[cornerIndex] += value;
        if (++cornerIndex === cornerMarks.length) {
          break;
        }
      }
    }

    let centerMarks = "";
    for (let value = 1; value <= 9; ++value) {
      if (this.props.cell.centerMarks[value]) {
        centerMarks += value;
      }
    }

    return (
      <div
        className={getClassName()}
        onClick={this.props.onClick}
      >
        <div className="pencil-marks">
          <div className="pencil-mark corner top-l">{cornerMarks[0]}</div>
          <div className="pencil-mark corner top-r">{cornerMarks[1]}</div>
          <div className="pencil-mark corner bottom-l">{cornerMarks[2]}</div>
          <div className="pencil-mark corner bottom-r">{cornerMarks[3]}</div>
          <div className="pencil-mark corner top-c">{cornerMarks[4]}</div>
          <div className="pencil-mark corner bottom-c">{cornerMarks[5]}</div>
          <div className="pencil-mark central">{centerMarks}</div>
        </div>
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
      selectedColor: 0,
      sudoku: new SudokuModel(),
    };
    this.saveTextArea = React.createRef();
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
      let number = event.key.charCodeAt(0) - "0".charCodeAt(0);
      if (state.mode === "normal") {
        state.sudoku.setValueInSelectedCells(number);
      } else if (state.mode === "center") {
        state.sudoku.toggleCenterInSelectedCells(number);
      } else if (state.mode === "corner") {
        state.sudoku.toggleCornerInSelectedCells(number);
      }
    } else if (event.key === "Delete") {
      if (state.mode === "color") {
        state.sudoku.setColorInSelectedCells(null);
      } else {
        state.sudoku.clearValueInSelectedCells();
      }
    } else if (event.key === "Enter") {
      if (state.mode === "color") {
        state.sudoku.setColorInSelectedCells(state.selectedColor);
      }
    } else if (event.key === "ArrowLeft") {
      state.sudoku.moveSelection(0, -1);
    } else if (event.key === "ArrowRight") {
      state.sudoku.moveSelection(0, +1);
    } else if (event.key === "ArrowUp") {
      state.sudoku.moveSelection(-1, 0);
    } else if (event.key === "ArrowDown") {
      state.sudoku.moveSelection(+1, 0);
    } else if (event.key === " ") {
      if (state.mode === "normal") {
        state.mode = "center";
      } else if (state.mode === "center") {
        state.mode = "corner";
      } else if (state.mode === "corner") {
        state.mode = "color";
      } else {
        state.mode = "normal";
      }
    } else if (event.key === "a") {
      state.mode = "normal";
    } else if (event.key === "z") {
      state.mode = "center";
    } else if (event.key === "x") {
      state.mode = "corner";
    } else if (event.key === "c") {
      state.mode = "color";
    }
    this.setState(state);
  }

  handleSetMode = (mode, color) => {
    console.log(`handleSetMode(mode=${mode}, color=${color})`);
    let state = this.cloneState();
    state.mode = mode;
    if (color !== null) {
      state.selectedColor = color;
    }
    this.setState(state);
  }

  handleLoad = (event) => {
    let savedPuzzle = event.clipboardData.getData("Text");
    console.log(`handleLoad(state='${savedPuzzle}')`);
    let state = this.cloneState();
    state.sudoku.loadPuzzle(savedPuzzle);
    this.setState(state);
  }

  handleSave = () => {
    this.saveTextArea.current.value = this.state.sudoku.savePuzzle();
    this.saveTextArea.current.style.display = "block";
    this.saveTextArea.current.select();
    document.execCommand("copy");
    this.saveTextArea.current.style.display = "none";
  }

  // ReactJS stuff

  componentDidMount() {
    window.addEventListener("keydown", this.handleKey);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKey);
  }

  render() {
    let renderModeButton = (mode, shortcut) => {
      let modeUpper = mode.charAt(0).toUpperCase() + mode.slice(1);
      let text = `${modeUpper} (${shortcut})`
      let btnClass = this.state.mode === mode
        ? "btn-dark"
        : "btn-outline-dark";
      return (
        <button
          className={`btn mode ${btnClass}`}
          onClick={() => this.handleSetMode(mode, null)}
        >
          {text}
        </button>
      );
    }

    let renderColorButton = (colorId) => {
      let btnClass = (this.state.mode === "color"
          && this.state.selectedColor === colorId)
        ? "btn-dark"
        : "btn-outline-dark";
      return (
        <button
          className={`btn color ${btnClass}`}
          onClick={() => this.handleSetMode("color", colorId)}
        >
          <div className={`sample color${colorId}`}></div>
        </button>
      );
    }

    return (
      <div className="game" onPaste={this.handleLoad}>
        <Board
          sudoku={this.state.sudoku}
          handleClick={this.handleClick}
        />
        <div className="panel">
          <div className="mode">
            {renderModeButton("normal", "A")}
            {renderModeButton("center", "Z")}
            {renderModeButton("corner", "X")}
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
          <div className="actions">
            <textarea ref={this.saveTextArea}></textarea>
            <button
              className="btn btn-outline-dark"
              onClick={this.handleSave}
            >
              Copy to clipboard
            </button>
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
