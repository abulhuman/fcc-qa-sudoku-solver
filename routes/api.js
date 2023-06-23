'use strict';

const { checkPuzzle, validatePuzzle } = require('../middleware/sudoku.js');
const { check, solve } = require('../controllers/sudoku.js');

module.exports = function (app) {
    app.use(validatePuzzle);
    app.route('/api/check').post(checkPuzzle, check);
    app.route('/api/solve').post(solve);
};