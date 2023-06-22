const { SudokuSolver, Cell } = require('./sudoku-solver.js');

const solve = (req, res, next) => {
    const { puzzle } = req.body;
    const solverRef = new SudokuSolver(null, puzzle);
    const answer = solverRef.getSolution();

    res.status(200).json(answer);
};

const check = (req, res, next) => {
    const { puzzle, coordinate, value } = req.body;
    const cellRef = new Cell(value, coordinate, puzzle);
    const answer = cellRef.check();

    res.status(200).json(answer);
};

module.exports = {
    solve,
    check
};