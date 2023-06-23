// /**
//  * Instructions:
//  * 1. The `validate` function should take a given puzzle string and check it to see if it has 81 valid characters for the input.
//  * 2. The `checkXYZ` functions should be validating against the current state of the board.
//  * 3. The `solve` function should handle solving any given valid puzzle string, not just the test inputs and solutions. 
//  * 
//  * You are expected to write out the logic to solve this.
//  */
const CustomError = require('../errors/custom-error.js');


/**
 * Represents a Sudoku cell.  Each cell has a value, a coordinate, and a list of possible values. 
 * The cell can be solved or unsolved.  If the cell is solved, it will have a current value. 
 * If the cell is unsolved, it will have a list of possible values. 
 * The cell can be solved by setting the current value to the only possible value. 
 * The cell can be unsolved by setting the current value to 0.  
 */
export class Cell {
  /**
   * Creates a new Cell object.
   * @constructor
   * @param {number} val - The value of the cell.
   * @param {string} coord - The coordinate of the cell.
   * @param {object} game - The current game object.
   */
  constructor(val, coord, game) {
    this.value = String(val);
    this.solved = false;
    this.coordinate = coord.toUpperCase();
    this.currentGame = game;
    this.possibilities = [];
    this.currentValue = 0;
  }

  /**
   * Returns the status of the current cell.
   * @returns {object} - An object containing the validity of the current cell.
   * @throws {object} - An object containing an error message if the value or coordinate is invalid.
   */
  getStatus() {
    const validValues = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9']);

    if (validValues.has(this.value) == false) {
      throw { message: 'Invalid value' };
    }

    const [row, col] = this.coordinate.split('');

    let letterChar = (() => {
      let min = 'A'.charCodeAt();
      let max = 'I'.charCodeAt();
      if (row.charCodeAt() < min || row.charCodeAt() > max) {
        return false;
      }
      return true;
    })();

    if (this.coordinate.length > 2 || validValues.has(col) === false || letterChar === false) {
      throw { message: 'Invalid coordinate' };
    }
    return { valid: true };
  };

  /**
   * Returns the row index of the current cell.
   * @param {string} letter - The letter representing the row index.
   * @returns {number} - The row index of the current cell.
   */
  getRows(letter) {
    const rows = {
      'A': 0, 'B': 9, 'C': 18,
      'D': 27, 'E': 36, 'F': 45,
      'G': 54, 'H': 63, 'I': 72,
    };
    if (letter) {
      return rows[letter];
    }
    return rows[this.coordinate[0]];
  };

  /**
   * Returns the column index of the current cell.
   * @param {string} num - The number representing the column index.
   * @returns {number} - The column index of the current cell.
   */
  getColumns(num) {
    if (num) {
      return (Number(num) - 1);
    }
    return (Number(this.coordinate[1]) - 1);
  };

  /**
   * Checks if the current cell's value conflicts with other values on the board in the specified placement.
   * @param {string} place - The placement to check for conflicts ('row', 'column', or 'region').
   * @returns {string} - An empty string if there are no conflicts, otherwise the placement where the conflict occurred.
   */
  onBoard(place) {
    const placements = {
      'row': (i) => (this.getRows() + i),
      'column': (i) => (this.getColumns() + (9 * i)),
      'region': (i) => {
        let letter = this.coordinate[0] > 'F' ? 'G' : this.coordinate[0] > 'C' ? 'D' : 'A';
        let num = this.coordinate[1] > '6' ? '7' : this.coordinate[1] > '3' ? '4' : '1';
        let leap = i > 5 ? 12 : i > 2 ? 6 : 0;
        return (this.getRows(letter) + this.getColumns(num) + i + leap);
      }
    };
    const valuesOnBoard = new Set([]);

    for (let i = 0; i < 9; i++) {
      let index = placements[place](i);
      if (this.getColumns() + this.getRows() === index && this.currentGame[index] === this.value) {
        // If we're checking for a coordinate that already have a value in the default puzzle
        // and its value is the value asked for checking it should return { valid: true }
        continue;
      }
      valuesOnBoard.add(this.currentGame[index]);
    }

    if (valuesOnBoard.has(this.value)) {
      return place;
    }
    return '';
  };

  /**
   * Checks if the current cell's value conflicts with other values on the board in the specified placement.
   * @returns {Object} - An object containing the validity of the current cell and any conflicting placements.
   */
  check() {
    const conflictCases = ['row', 'column', 'region'].filter(str => this.onBoard(str));

    if (conflictCases.length) {
      return {
        valid: false,
        conflict: conflictCases
      };
    }
    return { valid: true };
  };

  /**
   * Resets the current cell's value to an empty cell ('.') and sets the current value index to 0.
   */
  resetValues() {
    this.currentValue = 0;
    this.value = '.';
  };

  /**
   * Updates the current game string with the current cell's value at the current coordinate.
   * @returns {string} - The updated game string.
   */
  updateGame() {
    let idx = this.getRows() + this.getColumns();
    let tempArr = this.currentGame.split('');
    tempArr[idx] = this.value;
    this.currentGame = tempArr.join('');
    return this.currentGame;
  };

  /**
   * Checks if the current cell is solved (i.e. has only one possibility) and sets the cell value if it is solved.
   */
  isCellSolved() {
    if (this.possibilities.length === 1) {
      this.setValue();
      this.solved = true;
    }
  };

  /**
   * Throws an error if the current cell has no possible values and is not already solved.
   * @throws {object} - An object containing an error message if the cell cannot be solved.
   */
  notSolvable() {
    if (!this.possibilities.length && !this.solved) {
      throw { message: 'Puzzle cannot be solved' };
    }
  };

  /**
   * Updates the current cell's value to the next possible value if the current value conflicts with other values on the board.
   * If there are no more possible values, the function does nothing.
   * @returns {void}
   */
  updateValue() {
    if (!this.check().valid && this.currentValue < this.possibilities.length - 1) {
      this.currentValue++;
      this.setValue();
      return this.updateValue();
    }
  };

  /**
   * Sets the coordinate of the current cell based on the given index.
   * @param {number} index - The index of the current cell.
   * @returns {void}
   */
  setCoordinate(index = 0) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    this.coordinate = letters[Math.floor(index / 9)] + ((index % 9) + 1);
  };

  /**
   * Sets the value of the cell to the given number or to the current possibility based on the current value index.
   * @param {number} num - The number to set the cell value to.
   */
  setValue(num) {
    if (num) {
      this.value = `${num}`;
    } else {
      this.value = this.possibilities[this.currentValue];
    }
  };


  /**
   * Sets the possible values for the current cell based on the values that do not conflict with other values on the board.
   * If the cell is already solved, the function does nothing.
   * @returns {void}
   */
  setPossibilities() {
    for (let i = 1; i < 10; i++) {
      this.setValue(i);
      if (this.check().valid) {
        this.possibilities.push(this.value);
      }
    }

    this.resetValues();
    this.isCellSolved();
    this.notSolvable();
  };
}

/**
 * The `SudokuSolver` class represents a Sudoku puzzle solver.
 * It contains methods for validating the puzzle, solving the puzzle, and checking the solution.
 */
export class SudokuSolver {
  /**
   * Creates a new instance of SudokuSolver.
   * @constructor
   * @param {object} cell - The current cell being solved.
   * @param {string} puzzle - The current state of the Sudoku puzzle as a string.
   */
  constructor(cell, puzzle) {
    this.cell = cell;
    this.cellsList = [];
    this.cellIndex = 0;
    this.puzzle = puzzle;
  }

  /**
   * Validates the current state of the Sudoku puzzle.
   * @throws {object} - An object containing an error message if the puzzle is invalid.
   * @returns {object} - An object containing a boolean value indicating whether the puzzle is valid.
   */
  validate() {
    if (this.puzzle.length !== 81) {
      throw { message: 'Expected puzzle to be 81 characters long' };
    }
    const validChars = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '.']);

    for (let i = 0; i < this.puzzle.length; i++) {
      if (validChars.has(this.puzzle[i]) === false) {
        throw { message: 'Invalid characters in puzzle' };
      }
    }

    return { valid: true };
  };

  /**
   * Updates the current state of the Sudoku puzzle based on the current cell's value.
   * @returns {void}
   */
  updatePuzzle() {
    this.puzzle = this.cell.updateGame();
  };

  /**
   * Resets the current cell's value to 0 and updates the puzzle state accordingly.
   * @returns {void}
   */
  reset() {
    this.cell.resetValues();
    this.updatePuzzle();
  };

  /**
   * Backtracks to the previous unsolved cell and updates the current cell to the previous possibility.
   * If the current cell is the first cell and it is already solved, the function throws an error.
   * @throws {object} - An object containing an error message if the puzzle cannot be solved.
   * @returns {void}
   */
  backtrack() {
    this.cellIndex--;

    if (this.cellIndex < 0) {
      throw { message: 'Puzzle cannot be solved' };
    }

    if (this.cellsList[this.cellIndex].solved) {
      return this.backtrack();
    }
  };

  /**
   * Updates the current cell's value to the next possibility.
   * If there are no more possibilities, the function backtracks to the previous unsolved cell.
   * @throws {object} - An object containing an error message if the puzzle cannot be solved.
   * @returns {void}
   */
  updateCell() {
    if (this.cell.currentValue === this.cell.possibilities.length - 1) {
      this.reset();
      this.backtrack();
      this.cell = this.cellsList[this.cellIndex];
      return this.updateCell();
    }
    this.cell.currentValue++;
  };

  /**
   * Changes the current cell to the next cell in the puzzle.
   * If the current cell is valid, the function moves to the next cell.
   * If the current cell is invalid, the function updates the current cell's value to the next possibility.
   * @returns {void}
   */
  changeCell() {
    if (this.cell.check().valid) {
      this.cellIndex++;
    } else {
      this.updateCell();
    }
  };

  /**
   * Checks if all cells in the Sudoku puzzle have been solved.
   * @returns {boolean} - A boolean value indicating whether all cells have been solved.
   */
  allCellsSolved() {
    for (let i = 0; i < this.cellsList.length; i++) {
      if (this.cellsList[i].solved === false) {
        return false;
      }
    }
    return true;
  };


  /**
   * Moves the current cell index forward to the next unsolved cell in the Sudoku puzzle.
   * If the current cell is already solved, the function recursively calls itself to move to the next cell.
   * @returns {void}
   */
  forward() {
    if (this.cellsList[this.cellIndex].solved && this.cellIndex < this.cellsList.length) {
      this.cellIndex++;
      return this.forward();
    }
  };

  /**
   * Sets the current cell to the cell at the current cell index, sets the current game to the puzzle,
   * sets the cell's value, and updates the cell's value.
   * @returns {void}
   */
  setCell() {
    this.cell = this.cellsList[this.cellIndex];
    this.cell.currentGame = this.puzzle;
    this.cell.setValue();
    this.cell.updateValue();
  };

  /**
   * Solves the Sudoku puzzle by recursively updating the current cell's value and moving to the next cell until all cells are solved.
   * @throws {object} - An object containing an error message if the puzzle cannot be solved.
   * @returns {object} - An object containing a message indicating the puzzle has been solved.
   */
  solve() {
    this.validate();
    this.forward();
    this.setCell();
    this.changeCell();
    this.updatePuzzle();

    if (this.puzzle.includes('.')) {
      return this.solve();
    }
    return { message: 'Puzzle solved' };
  };

  /**
   * Sets the cellsList property with a list of all unsolved cells in the Sudoku puzzle.
   * For each unsolved cell, a new Cell object is created and added to the cellsList array.
   * If the unsolved cell has only one possibility, the cell's value is updated and the puzzle is updated.
   * @returns {void}
   */
  setCellsList() {
    for (let i = 0; i < this.puzzle.length; i++) {
      if (this.puzzle[i] !== '.') continue;

      this.cell = new Cell('.', '', this.puzzle);
      this.cell.setCoordinate(i);
      this.cell.setPossibilities();
      this.cellsList.push(this.cell);

      if (this.cell.solved) {
        this.updatePuzzle();
      }
    }
  };

  /**
   * Validates the puzzle, sets the cells list, and solves the Sudoku puzzle.
   * If the puzzle cannot be solved, the function throws an error.
   * @throws {CustomError} - An error object containing an error message and status code.
   * @returns {object} - An object containing a message indicating the puzzle has been solved and the solution.
   */
  getSolution() {
    try {
      this.validate();
      this.setCellsList();

      if (!this.cellsList.length) {
        throw { message: 'Puzzle cannot be solved' };
      }

      if (this.allCellsSolved() === true) {
        return {
          message: 'Puzzle solved',
          solution: this.puzzle
        };
      }

      this.solve();
    } catch (e) {
      throw new CustomError(e.message, 200);
    }

    return {
      message: 'Puzzle solved',
      solution: this.puzzle
    };
  };
}

module.exports = {
  Cell,
  SudokuSolver
};
