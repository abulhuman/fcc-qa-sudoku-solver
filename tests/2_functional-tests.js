const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const { suite, test } = require('mocha');

chai.use(chaiHttp);

const { puzzlesAndSolutions } = require('../controllers/puzzle-strings');

const openRequest = chai.request(server).keepOpen();
const pathApi = '/api';

suite('Functional Tests', function () {
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
                    assert.strictEqual(res.status, 400);
                    assert.deepEqual(res.body, { error: 'Puzzle cannot be solved' });
                    done();
                });
        });
    });
});

suite('Hints', function () {
    test(`H-1) You can POST /api/solve with form data containing puzzle which will be a 
    string containing a combination of numbers (1-9) and periods . to represent empty 
    spaces. The returned object will contain a solution property with the solved puzzle.`,
        (done) => {
            const input =
                '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
            const output =
                '769235418851496372432178956174569283395842761628713549283657194516924837947381625';

            openRequest
                .post(`${pathApi}/solve`)
                .send({ puzzle: input })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 200);
                    assert.strictEqual(res.body.solution, output);
                    done();
                });
        });

    test(`H-2) If the object submitted to /api/solve is missing puzzle, the returned value
     will be { error: 'Required field(s) missing' }`, (done) => {
        const input =
            '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
        const output = 'Required field missing';

        openRequest
            .post(`${pathApi}/solve`)
            .send({ notpuzzle: input })
            .end(function (err, res) {
                assert.strictEqual(res.status, 400);
                assert.strictEqual(res.body.error, output);
                done();
            });
    });

    test(`H-3) If the puzzle submitted to /api/solve contains values which are not numbers
     or periods, the returned value will be { error: 'Invalid characters in puzzle' }`,
        (done) => {
            const input =
                'AA9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
            const output = 'Invalid characters in puzzle';

            openRequest
                .post(`${pathApi}/solve`)
                .send({ puzzle: input })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 400);
                    assert.strictEqual(res.body.error, output);
                    done();
                });
        });

    test(`H-4) If the puzzle submitted to /api/solve is greater or less than 81 characters,
        the returned value will be { error: 'Expected puzzle to be 81 characters long' }`,
        (done) => {
            const inputs = [
                '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6.',
                '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6...'
            ];
            const output = 'Expected puzzle to be 81 characters long';

            const shouldBeDone = []; // new Array(inputs.length).fill(false);

            for (const input of inputs) {
                openRequest
                    .post(`${pathApi}/solve`)
                    .send({ puzzle: input })
                    .end(function (err, res) {
                        assert.strictEqual(res.status, 400);
                        assert.strictEqual(res.body.error, output);
                        shouldBeDone.push(true);
                    });
            }

            setTimeout(() => {
                assert.strictEqual(shouldBeDone.length, inputs.length);
                assert.sameMembers(shouldBeDone, [true, true]);
                done();
            }, 1000);


            // console.log({ shouldBeDone });
            // if (shouldBeDone.every((elem) => elem)) done();
        });

    test(`H-5) If the puzzle submitted to /api/solve is invalid or cannot be solved, the
        returned value will be { error: 'Puzzle cannot be solved' }`, (done) => {
        const input =
            '9.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
        const output = 'Puzzle cannot be solved';

        openRequest
            .post(`${pathApi}/solve`)
            .send({ puzzle: input })
            .end(function (err, res) {
                assert.strictEqual(res.status, 400);
                assert.strictEqual(res.body.error, output);
                done();
            });
    });

    test(`H-6) You can POST /api/check an object containing puzzle, coordinate, and value
        where the coordinate is the letter A-I indicating the row, followed by a number 1-9
        indicating the column, and value is a number from 1-9.` , (done) => {
        const input =
            '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
        const coordinate = 'A1';
        const value = '7';

        openRequest
            .post(`${pathApi}/check`)
            .send({ puzzle: input, coordinate, value })
            .end(function (err, res) {
                assert.strictEqual(res.status, 200);
                assert.property(res.body, 'valid');
                assert.isBoolean(res.body.valid);
                assert.isTrue(res.body.valid);
                done();
            });
    });

    test(`H-7) The return value from the POST to /api/check will be an object containing a
        valid property, which is true if the number may be placed at the provided coordinate
        and false if the number may not. If false, the returned object will also contain a
        conflict property which is an array containing the strings "row", "column", and/or
        "region" depending on which makes the placement invalid.`, (done) => {
        const input =
            '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
        const coordinate = 'A1';
        const value = '1';
        const conflict = ['row', 'column'];

        openRequest
            .post(`${pathApi}/check`)
            .send({ puzzle: input, coordinate, value })
            .end(function (err, res) {
                const parsed = res.body;
                assert.strictEqual(res.status, 200);
                assert.property(parsed, 'valid');
                assert.isBoolean(parsed.valid);
                assert.isFalse(parsed.valid);
                assert.property(parsed, 'conflict');
                assert.isArray(parsed.conflict);
                assert.sameMembers(parsed.conflict, conflict);
                assert.include(parsed.conflict, 'row');
                assert.include(parsed.conflict, 'column');
                done();
            });
    });

    test(`H-8) If value submitted to /api/check is already placed in puzzle on that 
    coordinate, the returned value will be an object containing a valid property with true
    if value is not conflicting.` , (done) => {
        const input =
            '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
        const coordinate = 'C3';
        const value = '2';

        openRequest
            .post(`${pathApi}/check`)
            .send({ puzzle: input, coordinate, value })
            .end(function (err, res) {
                assert.strictEqual(res.status, 200);
                assert.property(res.body, 'valid');
                assert.isBoolean(res.body.valid);
                assert.isTrue(res.body.valid);
                done();
            });
    });

    test(`H-9) If the puzzle submitted to /api/check contains values which are not numbers
     or periods, the returned value will be { error: 'Invalid characters in puzzle' }`,
        (done) => {
            const input =
                'AA9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
            const coordinate = 'A1';
            const value = '1';
            const output = 'Invalid characters in puzzle';

            openRequest
                .post(`${pathApi}/check`)
                .send({ puzzle: input, coordinate, value })
                .end(function (err, res) {
                    assert.strictEqual(res.status, 400);
                    assert.equal(res.body.error, output);
                    done();
                });
        });

    test(`H-10) If the puzzle submitted to /api/check is greater or less than 81 characters,
        the returned value will be { error: 'Expected puzzle to be 81 characters long' }`,
        (done) => {
            const inputs = [
                '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6.',
                '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6...'
            ];
            const output = 'Expected puzzle to be 81 characters long';

            const testPuzzle = (input) => {
                return openRequest
                    .post(`${pathApi}/check`)
                    .send({ puzzle: input })
                    .then((res) => res.body);
            };

            const outputs = inputs.map(testPuzzle);

            Promise.all(outputs).then((results) => {
                const expectedErrors = new Array(inputs.length).fill(output);

                assert.sameDeepMembers(results.map((r) => r.error), expectedErrors);
                done();
            });

        });

    test(`H-11) If the object submitted to /api/check is missing puzzle, coordinate or value,
        the returned value will be { error: Required field(s) missing }`, (done) => {
        const inputs = [
            {
                puzzle: '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..',
                value: '1',
            },
            {
                puzzle: '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..',
                coordinate: 'A1',
            },
            {
                coordinate: 'A1',
                value: '1'
            }
        ];

        const output = 'Required field(s) missing';

        const testPuzzle = (input) => {
            return openRequest
                .post(`${pathApi}/check`)
                .send(input)
                .then((res) => res.body);

        };

        const outputs = inputs.map(testPuzzle);

        Promise.all(outputs).then((results) => {
            const expectedErrors = new Array(inputs.length).fill(output);
            // expectedErrors.push('Required field missing');
            assert.sameMembers(results.map((result) => result.error), expectedErrors);
            done();
        });

        // ! ===================
        // const shouldBeDone = [];
        // for (const input of inputs) {
        //     const output = 'Required field(s) missing';

        //     openRequest
        //         .post(`${pathApi}/check`)
        //         .send(input)
        //         .end(function (err, res) {
        //             assert.strictEqual(res.status, 400);
        //             assert.strictEqual(res.body.error, output); // debug
        //             shouldBeDone.push(true);
        //         });
        // }
        // setTimeout(() => {
        //     assert.sameMembers(shouldBeDone, [true, true]);
        //     setTimeout(() => {
        //         assert.sameMembers(shouldBeDone, [true, true, true]);
        //         done();
        //     }, 2000);
        // }, 1000);
        // ! ===================
    });

    test(`H-12) If the coordinate submitted to /api/check does not point to an existing grid
        cell on the puzzle, the returned value will be { error: 'Invalid coordinate' }`,
        (done) => {
            const input =
                '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
            const output = 'Invalid coordinate';
            const coordinates = ['A0', 'A10', 'J1', 'A', '1', 'XZ18'];
            const value = '7';

            const testPuzzle = (coordinate) => {
                return openRequest
                    .post(`${pathApi}/check`)
                    .send({ puzzle: input, coordinate, value })
                    .then((res) => res.body);
            };

            const outputs = coordinates.map(testPuzzle);

            Promise.all(outputs).then((results) => {
                assert.sameMembers(results.map((result) => result.error), new Array(coordinates.length).fill(output));
                done();

            });


            // for (const coordinate of coordinates) {
            //     openRequest
            //         .post(`${pathApi}/check`)
            //         .send({ puzzle: input, coordinate, value })
            //         .end(function (err, res) {
            //             assert.strictEqual(res.status, 400);
            //             assert.equal(res.body.error, output);
            //             done();
            //         });
            // }
        });

    test(`H-13) If the value submitted to /api/check is not a number between 1 and 9, the
        returned value will be { error: 'Invalid value' }`, (done) => {
        const input =
            '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
        const output = 'Invalid value';
        const coordinate = 'A1';
        const values = ['0', '10', 'A'];

        const testPuzzle = (value) => {
            return openRequest
                .post(`${pathApi}/check`)
                .send({ puzzle: input, coordinate, value })
                .then((res) => res.body);
        };

        const outputs = values.map(testPuzzle);

        Promise.all(outputs).then((results) => {
            assert.sameMembers(results.map((result) => result.error), new Array(values.length).fill(output));
            done();
        });


        // for (const value of values) {
        //     openRequest
        //         .post(`${pathApi}/check`)
        //         .send({ puzzle: input, coordinate, value })
        //         .end(function (err, res) {
        //             assert.strictEqual(res.status, 400);
        //             assert.equal(res.body.error, output);
        //             done();
        //         });
        // }
    });

    // test(`H-14) All 12 unit tests are complete and passing.`, (done) => {
    //     assert.isTrue(true);
    //     return done();
    //     openRequest
    //         .get(`_api/get-tests`)
    //         .end(function (err, res) {
    //             assert.isArray(res);
    //             const unitTests = res.filter((test) => !!test.context.match(/Unit\s*Tests/gi));
    //             assert.isAtLeast(unitTests.length, 12, 'At least 12 tests passed');
    //             unitTests.forEach((test) => {
    //                 assert.equal(test.state, 'passed', 'Test in Passed State');
    //                 assert.isAtLeast(
    //                     test.assertions.length,
    //                     1,
    //                     'At least one assertion per test'
    //                 );
    //             });

    //             assert.equal(res.length, 12);
    //             done();
    //         }
    //         );

    // });

    // test(`H-15) All 14 functional tests are complete and passing.`, (done) => {
    //     assert.isTrue(true);
    //     return done();
    //     openRequest
    //         .get(`_api/get-tests`)
    //         .end(function (err, res) {
    //             assert.isArray(res);
    //             const functionalTests = res.filter((test) => !!test.context.match(/Functional\s*Tests/gi));
    //             assert.isAtLeast(functionalTests.length, 14, 'At least 14 tests passed');
    //             functionalTests.forEach((test) => {
    //                 assert.equal(test.state, 'passed', 'Test in Passed State');
    //                 assert.isAtLeast(
    //                     test.assertions.length,
    //                     1,
    //                     'At least one assertion per test'
    //                 );
    //             });

    //             assert.equal(res.length, 14);
    //             done();
    //         }
    //         );
    // });

});