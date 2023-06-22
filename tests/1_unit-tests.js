const chai = require('chai');
const assert = chai.assert;
const { suite, test } = require('mocha');

const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
const { SudokuSolver, Cell } = require('../controllers/sudoku-solver.js');

suite('Unit Tests', () => {
    const validationRef = new SudokuSolver(null, puzzlesAndSolutions[0][0]);
    test('#Valid String Length', function (done) {
        let { valid } = validationRef.validate();
        assert.isTrue(valid, 'Calling .validate() on puzzle should return true');
        done();
    });
    test('#Invalid String Characters', function (done) {
        validationRef.puzzle = 'a.b..c.d4..63.12.7.2..5,,,,.9..1,,,,d.d.gggg.3.7.2..9.ee...8..1..16,,,,wwssad.37.';
        assert.throw(() => validationRef.validate(), 'Invalid characters in puzzle', '', 'Should throw a error message');
        done();
    });
    test('#Invalid String Length', function (done) {
        validationRef.puzzle = '1.5..2.84..63.12.7.2..5.....9..1....';
        assert.throw(() => validationRef.validate(), 'Expected puzzle to be 81 characters long', '', 'Should throw a error message');
        done();
    });
});
suite('Unit Tests - Check Puzzle', function () {
    const checkRef = new Cell('', '.', puzzlesAndSolutions[0][0]);
    test('#Valid Row placement', function (done) {
        checkRef.setCoordinate(0);
        checkRef.setValue(1);
        assert.isTrue(checkRef.check().valid, 'Calling .check() should return { valid: true }');
        done();
    });
    test('#Invalid Row placement', function (done) {
        checkRef.setValue(5);
        let result = checkRef.check();
        assert.isNotTrue(result.valid, 'valid should not equals true');
        assert.include(result.conflict, 'row', 'Conflict array should include row string');
        done();
    });
    test('#Valid Column placement', function (done) {
        checkRef.setCoordinate(12);
        checkRef.setValue(3);
        assert.isTrue(checkRef.check().valid, 'Calling .check() should return { valid: true }');
        done();
    });
    test('#Invalid Column placement', function (done) {
        checkRef.setCoordinate(20);
        checkRef.setValue(9);
        let result = checkRef.check();
        assert.isNotTrue(result.valid, 'result.valid should not equals true');
        assert.include(result.conflict, 'column', 'Conflict array should include column string');
        done();
    });
    test('#Valid Region placement', function (done) {
        checkRef.setCoordinate(64);
        checkRef.setValue(3);
        assert.isTrue(checkRef.check().valid, 'Calling .check() should return { valid: true }');
        done();
    });
    test('#Invalid Region placement', function (done) {
        checkRef.setCoordinate(64);
        checkRef.setValue(9);
        let result = checkRef.check();
        assert.isNotTrue(result.valid, 'valid should not equals true');
        assert.include(result.conflict, 'column', 'Conflict array should include region string');
        done();
    });
});
suite('Unit Tests - Solve Puzzle', function () {
    const solveRef = new SudokuSolver();
    test('#Valid puzzle string', function (done) {
        solveRef.puzzle = puzzlesAndSolutions[2][0];
        assert.strictEqual(solveRef.getSolution().solution, puzzlesAndSolutions[2][1]);
        done();
    });
    test('#Invalid puzzle string', function (done) {
        solveRef.puzzle = '1.5..2.84..63.12.7.2..5.....9..1....';
        assert.throw(() => solveRef.solve(), 'Expected puzzle to be 81 characters long', '', 'Calling solveRef.solve() should throw an Error');
        done();
    });
    test('#Solve incomplete puzzle', function (done) {
        solveRef.puzzle = puzzlesAndSolutions[3][0];
        assert.strictEqual(solveRef.getSolution().solution, puzzlesAndSolutions[3][1]);
        done();
    });
});