'use strict';

// const SudokuSolver = require('../controllers/sudoku-solver.js');

// const router = require('express').Router();

// router.get('/', homeSudoku);

// module.exports = function (app) {

//   let solver = new SudokuSolver();

//   app.route('/api/check')
//     .post((req, res) => {

//     });

//   app.route('/api/solve')
//     .post((req, res) => {

//     });
// };
// const { Router } = require('express');
// // import fcctesting  '../../routes/fcctesting.js';
const { checkPuzzle, validatePuzzle } = require('../middleware/sudoku.js');
const { check, solve } = require('../controllers/sudoku.js');


// const apiRoutes = Router();

// apiRoutes.get('/', home);

// apiRoutes.use(validatePuzzle);

// apiRoutes.post('/api/check', checkPuzzle, check);
// apiRoutes.post('/api/solve', solve);

// // fcctesting(sudokuSolver);

// module.exports = apiRoutes;

module.exports = function (app) {
    app.use(validatePuzzle);
    app.route('/api/check').post(checkPuzzle, check);
    app.route('/api/solve').post(solve);
};