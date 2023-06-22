const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const { suite, test } = require('mocha');

chai.use(chaiHttp);

const { puzzlesAndSolutions } = require('../controllers/puzzle-strings');

const openRequest = chai.request(server).keepOpen();

suite('Functional Tests', function () {
    const pathApi = '/api';

    suite('Homepage', function () {
        test('#Get Homepage', function (done) {
            openRequest
                .get('/')
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    done();
                });
        });
    });
    suite('Post to /api/check', function () {
        test('#All Fields', function (done) {
            openRequest
                .post(`${pathApi}/check`)
                .send({ puzzle: puzzlesAndSolutions[1][0], coordinate: 'A1', value: 5 })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.deepEqual(res.body, { valid: true });
                    done();
                });
        });
        test('#Single Conflict', function (done) {
            openRequest
                .post(`${pathApi}/check`)
                .send({ puzzle: puzzlesAndSolutions[1][0], coordinate: 'E5', value: 6 })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.deepEqual(res.body, { valid: false, conflict: ['row'] });
                    done();
                });
        });
        test('#Multiple Conflicts', function (done) {
            openRequest
                .post(`${pathApi}/check`)
                .send({ puzzle: puzzlesAndSolutions[2][0], coordinate: 'D3', value: 6 })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.deepEqual(res.body, { valid: false, conflict: ['row', 'region'] });
                    done();
                });
        });
        test('#All Conflicts', function (done) {
            openRequest
                .post(`${pathApi}/check`)
                .send({ puzzle: puzzlesAndSolutions[2][0], coordinate: 'D5', value: 2 })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.deepEqual(res.body, { valid: false, conflict: ['row', 'column', 'region'] });
                    done();
                });
        });
        test('#Missing Fields', function (done) {
            openRequest
                .post(`${pathApi}/check`)
                .send({ puzzle: puzzlesAndSolutions[3][0], coordinate: 'D5', value: '' })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 400);
                    assert.deepEqual(res.body, { error: 'Required field(s) missing', field: 'value' });
                    done();
                });
        });
        test('#Invalid Characters', function (done) {
            openRequest
                .post(`${pathApi}/check`)
                .send({
                    puzzle: 'a.b..c.d4..63.12.7.2..5,,,,.9..1,,,,d.d.gggg.3.7.2..9.ee...8..1..16,,,,wwssad.37.',
                    coordinate: 'D5',
                    value: 3
                })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 400);
                    assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
                    done();
                });
        });
        test('#Invalid Length', function (done) {
            openRequest
                .post(`${pathApi}/check`)
                .send({
                    puzzle: '82..4..6...16..89...98315.749.157.............................53..4...96.415..81..7632..3...28.51',
                    coordinate: 'E3',
                    value: 5
                })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 400);
                    assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
                    done();
                });
        });
        test('#Invalid Coordinate', function (done) {
            openRequest
                .post(`${pathApi}/check`)
                .send({ puzzle: puzzlesAndSolutions[4][0], coordinate: 'P4', value: 8 })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 400);
                    assert.deepEqual(res.body, { error: 'Invalid coordinate' });
                    done();
                });
        });
        test('#Invalid Value', function (done) {
            openRequest
                .post(`${pathApi}/check`)
                .send({ puzzle: puzzlesAndSolutions[4][0], coordinate: 'P4', value: 22 })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 400);
                    assert.deepEqual(res.body, { error: 'Invalid value' });
                    done();
                });
        });
    });
    suite('Post to /api/solve', function () {
        test('#Valid Puzzle String', function (done) {
            openRequest
                .post(`${pathApi}/solve`)
                .send({ puzzle: puzzlesAndSolutions[4][0] })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.solution, puzzlesAndSolutions[4][1]);
                    done();
                });
        });
        test('#Missing Puzzle', function (done) {
            openRequest
                .post(`${pathApi}/solve`)
                .send({ puzzle: '' })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 400);
                    assert.deepEqual(res.body, { error: 'Required field missing', field: 'puzzle' });
                    done();
                });
        });
        test('#Invalid Characters', function (done) {
            openRequest
                .post(`${pathApi}/solve`)
                .send({ puzzle: 'a.b..c.d4..63.12.7.2..5,,,,.9..1,,,,d.d.gggg.3.7.2..9.ee...8..1..16,,,,wwssad.37.' })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 400);
                    assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
                    done();
                });
        });
        test('#Invalid Length', function (done) {
            openRequest
                .post(`${pathApi}/solve`)
                .send({ puzzle: '.7.89.....5....3.4.2..4..1.5689..472...6.....1.7.5.63873.' })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 400);
                    assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
                    done();
                });
        });
        test('#Not solvable', function (done) {
            openRequest
                .post(`${pathApi}/solve`)
                .send({ puzzle: '.7.89.....5....3.4.7.89.....5....3.4.2..4..1.5689..472...6.....1.7.5.63873.3..7.8' })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.deepEqual(res.body, { error: 'Puzzle cannot be solved' });
                    done();
                });
        });
    });
});