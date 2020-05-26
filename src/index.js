import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

const SudokuModel = require('./SudokuModel').default;

function getKeyWithModifiers(keyboardEvent) {
  let name = keyboardEvent.key;
  if (keyboardEvent.metaKey) {
    name = "Meta-" + name;
  }
  if (keyboardEvent.altKey) {
    name = "Atl-" + name;
  }
  if (keyboardEvent.ctrlKey) {
    name = "Control-" + name;
  }
  if (keyboardEvent.shiftKey) {
    name = "Shift-" + name;
  }
  return name;
}

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
    this.saveTextArea = React.createRef();
    this.state = {
      mode: "normal",
      selectedColor: 0,
      sudoku: new SudokuModel(),
    };
    this.history = [this.state.sudoku];
    this.historyPosition = 0;
  }

  pushToUndoList(sudoku) {
    if (this.historyPosition < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyPosition + 1);
    }
    this.history.push(sudoku);
    this.historyPosition++;
  }

  // Event handlers

  handleClick = (row, column) => {
    console.log(`handleClick(row=${row}, column=${column})`);
    let sudoku = this.state.sudoku.clone();
    sudoku.select(row, column);
    this.setState({sudoku: sudoku});
  }

  handleKey = (event) => {
    let keyWithModifiers = getKeyWithModifiers(event);
    console.log(`handleKey(${keyWithModifiers})`);

    // Shortcuts handled by delegating to other event handlers.
    if (keyWithModifiers === "Control-z") {
      return this.handleUndo();
    } else if (keyWithModifiers === "Control-y") {
      return this.handleRedo();
    }

    // Shortcuts which don't modify the state of sudoku
    if (keyWithModifiers === " ") {
      return this.setState((state) => {
        switch (state.mode) {
          case "normal": return {mode: "center"};
          case "center": return {mode: "corner"};
          case "corner": return {mode: "color"};
          default:       return {mode: "normal"};
        }
      });
    } else if (keyWithModifiers === "a") {
      return this.setState({mode: "normal"});
    } else if (keyWithModifiers === "z") {
      return this.setState({mode: "center"});
    } else if (keyWithModifiers === "x") {
      return this.setState({mode: "corner"});
    } else if (keyWithModifiers === "c") {
      return this.setState({mode: "color"});
    }

    // Shortcuts which modify the sudoku.
    let sudoku = this.state.sudoku.clone();
    if (/^[1-9]$/.test(keyWithModifiers)) {
      let number = keyWithModifiers.charCodeAt(0) - "0".charCodeAt(0);
      if (this.state.mode === "normal") {
        sudoku.setValueInSelectedCells(number);
        this.pushToUndoList(sudoku);
      } else if (this.state.mode === "center") {
        sudoku.toggleCenterInSelectedCells(number);
        this.pushToUndoList(sudoku);
      } else if (this.state.mode === "corner") {
        sudoku.toggleCornerInSelectedCells(number);
        this.pushToUndoList(sudoku);
      }
    } else if (keyWithModifiers === "Delete") {
      if (this.state.mode === "color") {
        sudoku.setColorInSelectedCells(null);
        this.pushToUndoList(sudoku);
      } else {
        sudoku.clearValueInSelectedCells();
        this.pushToUndoList(sudoku);
      }
    } else if (keyWithModifiers === "Enter") {
      if (this.state.mode === "color") {
        sudoku.setColorInSelectedCells(this.state.selectedColor);
        this.pushToUndoList(sudoku);
      }
    } else if (keyWithModifiers === "ArrowLeft") {
      sudoku.moveSelection(0, -1);
    } else if (keyWithModifiers === "ArrowRight") {
      sudoku.moveSelection(0, +1);
    } else if (keyWithModifiers === "ArrowUp") {
      sudoku.moveSelection(-1, 0);
    } else if (keyWithModifiers === "ArrowDown") {
      sudoku.moveSelection(+1, 0);
    }
    this.setState({sudoku: sudoku});
  }

  handleSetMode = (mode, color) => {
    console.log(`handleSetMode(mode=${mode}, color=${color})`);
    this.setState({mode: mode});
    if (color !== null) {
      this.setState({selectedColor: color});
    }
  }

  handleLoad = (event) => {
    let savedPuzzle = event.clipboardData.getData("Text");
    console.log(`handleLoad(state='${savedPuzzle}')`);
    let sudoku = this.state.sudoku.clone();
    sudoku.loadPuzzle(savedPuzzle);
    this.pushToUndoList(sudoku);
    this.setState({sudoku: sudoku});
  }

  handleSave = () => {
    this.saveTextArea.current.value = this.state.sudoku.savePuzzle();
    this.saveTextArea.current.style.display = "block";
    this.saveTextArea.current.select();
    document.execCommand("copy");
    this.saveTextArea.current.style.display = "none";
  }

  handleUndo = () => {
    if (this.historyPosition > 0) {
      this.setState({sudoku: this.history[--this.historyPosition]});
    }
  }

  handleRedo = () => {
    if (this.historyPosition < this.history.length - 1) {
      this.setState({sudoku: this.history[++this.historyPosition]});
    }
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
      let isSelected = this.state.mode === mode;
      return (
        <button
          className={"mode " + (isSelected ? "selected" : "")}
          onClick={() => this.handleSetMode(mode, null)}
        >
          {`${modeUpper} (${shortcut})`}
        </button>
      );
    }

    let renderColorButton = (colorId) => {
      let isSelected = (this.state.mode === "color"
                        && this.state.selectedColor === colorId)
      return (
        <button
          className={"color " + (isSelected ? "selected" : "")}
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
          <div className="controls">
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
            <button onClick={this.handleSave}>Copy to clipboard</button>
            <button onClick={this.handleUndo}>Undo</button>
            <button onClick={this.handleRedo}>Redo</button>
          </div>
          <textarea className="save" ref={this.saveTextArea}></textarea>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
