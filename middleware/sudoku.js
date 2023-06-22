import CustomError from '../errors/custom-error';
import { SudokuSolver, Cell } from '../controllers/sudoku-solver';


export const checkPuzzle = (req, res, next) => {
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

export const validatePuzzle = (req, res, next) => {
    if (!req.body.puzzle) {
        throw new CustomError('Required field missing', 400, { field: 'puzzle' });
    }

    try {
        const sudoku = new SudokuSolver(null, req.body.puzzle);
        sudoku.validate();
    } catch (e) {
        throw new CustomError(e.message, 400);
    }

    next();
};