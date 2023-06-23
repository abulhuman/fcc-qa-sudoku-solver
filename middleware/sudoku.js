const CustomError = require('../errors/custom-error.js');
const { SudokuSolver, Cell } = require('../controllers/sudoku-solver.js');


const checkPuzzle = (req, res, next) => {
    const { body } = req;

    if (!body.coordinate || !body.value) {
        let field = (!body.coordinate ? 'coordinate' : 'value');
        throw new CustomError('Required field(s) missing', 400, { field });
    }

    try {
        const gameCell = new Cell(body.value, body.coordinate, body.puzzle);
        gameCell.getStatus();
    } catch (e) {
        throw new CustomError(e.message, 400);
    }

    next();
};

const validatePuzzle = (req, res, next) => {
    const isPathOnAPISolve = req.path === '/api/solve';
    if (!req.body.puzzle) {
        throw new CustomError(`Required field${isPathOnAPISolve ? '' : '(s)'} missing`, 400, { field: 'puzzle' });
    }

    try {
        const sudoku = new SudokuSolver(null, req.body.puzzle);
        sudoku.validate();
    } catch (e) {
        throw new CustomError(e.message, 400);
    }

    next();
};

module.exports = {
    checkPuzzle,
    validatePuzzle
};