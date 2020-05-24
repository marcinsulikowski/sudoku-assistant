import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  render() {
    return (
      <button
        className="square"
        onClick={() => this.props.onClick()}
      >
        {this.props.square.value}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(row, column) {
    return <Square
      square={this.props.squares[row][column]}
      onClick={() => this.props.setValue(row, column, 8)}
    />
  }

  render() {
    return (
      <div>
        <div className="box">
          {this.renderSquare(0, 0)}
          {this.renderSquare(0, 1)}
          {this.renderSquare(0, 2)}
          <br />
          {this.renderSquare(1, 0)}
          {this.renderSquare(1, 1)}
          {this.renderSquare(1, 2)}
          <br />
          {this.renderSquare(2, 0)}
          {this.renderSquare(2, 1)}
          {this.renderSquare(2, 2)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "big",
      squares: Array(9),
    };

    for (let row = 0; row < 9; row++) {
      this.state.squares[row] = Array(9);
      for (let column = 0; column < 9; column++) {
        this.state.squares[row][column] = {
          value: null,
          centerMarks: Array(9).fill(false),
          cornerMarks: Array(9).fill(false),
        }
      }
    }
  }

  setValue(row, column, value) {
    if (this.state.mode === "big") {
      let newState = JSON.parse(JSON.stringify(this.state))
      newState.squares[row][column].value = value;
      this.setState(newState)
    }
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={this.state.squares}
            setValue={(row, column, value) => this.setValue(row, column, value)}
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
