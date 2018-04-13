#!/usr/bin/env node

let testData = [
    ['a', 'a', 'b', 'c'],
    ['a', 'c', 'a', 'a'],
    ['c', 'a', 'a', 'b'],
    ['a', 'c', 'c', 'g']
];

let expected = ['a', 'a', 'c',];

function allEmpty(lists) {
    let isEmpty = true;
    lists.forEach(l => {
        if (l.length) {
            isEmpty = false;
        }
    });

    return isEmpty;
}

// function merger(lists) {
//     let accumulator = [];
//
//     let currentIndex = 0;
//     for (; ;) {
//         console.log(lists);
//         console.log('accumulator', accumulator);
//         if (allEmpty(lists)) {
//             break;
//         }
//         let foundSecond = false;
//         let current = "";
//         let matchFound = false;
//         console.log('starting currentIndex', currentIndex);
//         console.log("");
//         console.log("");
//         for (let iteration = 0; iteration < 2; iteration++) {
//             for (let i = 0; i < lists.length; i++) {
//                 if (currentIndex === lists.length) {
//                     currentIndex = 0;
//                 }
//
//                 console.log('=============================');
//                 console.log('currentIndex:', currentIndex);
//                 console.log('=============================');
//                 if (lists[currentIndex].length) {
//                     if (current === "") {
//                         current = lists[currentIndex][0];
//                         console.log('current is blank, setting to', current);
//                         accumulator.push(current);
//                         lists[currentIndex].splice(0, 1);
//                         console.log('  lists:');
//                         console.log(lists);
//                         console.log('  accumulator', accumulator);
//                         matchFound = true;
//                     } else if (lists[currentIndex][0] === current && iteration === 0) {
//                         console.log(`${lists[currentIndex][0]} == ${current} and iteration === 0`);
//                         lists[currentIndex].splice(0, 1);
//                         console.log('  lists:');
//                         console.log(lists);
//                         matchFound = true;
//                     } else if (lists[currentIndex][0] === current && iteration === 1) {
//                         console.log(`${lists[currentIndex][0]} == ${current} and iteration === 1`);
//                         accumulator.push(current);
//                         lists[currentIndex].splice(0, 1);
//                         console.log('  lists:');
//                         console.log(lists);
//                         console.log('  accumulator', accumulator);
//                         foundSecond = true;
//                         currentIndex++;
//                         break;
//                     }
//                 }
//                 currentIndex++;
//                 if (!matchFound) {
//                     break;
//                 }
//             }
//             if (foundSecond || !matchFound) {
//                 break;
//             }
//         }
//     }
//
//     return accumulator;
// }

function merge2Debug(lists) {
    let accumulator = [];

    let currentIndex = 0;
    let current = "";
    let startNew = false;
    for (; ;) {
        console.log(lists);
        console.log('accumulator', accumulator);
        if (allEmpty(lists)) {
            break;
        }
        console.log('starting currentIndex', currentIndex);
        console.log("");
        console.log("");
        let matchFound = false;
        for (let i = 0; i < lists.length; i++) {
            if (currentIndex === lists.length) {
                currentIndex = 0;
            }

            if (lists[currentIndex].length) {
                if (current === "") {
                    current = lists[currentIndex][0];
                    console.log('current is blank, setting to', current);
                    accumulator.push(current);
                    lists[currentIndex].splice(0, 1);
                    console.log('  lists:');
                    console.log(lists);
                    console.log('  accumulator', accumulator);
                    matchFound = true;
                } else if (lists[currentIndex][0] === current && startNew) {
                    console.log(`${lists[currentIndex][0]} == ${current} && startNew`);
                    accumulator.push(current);
                    startNew = false;
                    lists[currentIndex].splice(0, 1);
                    console.log('  lists:');
                    console.log(lists);
                    console.log('  accumulator', accumulator);
                } else if (lists[currentIndex][0] === current) {
                    console.log(`${lists[currentIndex][0]} == ${current}`);
                    lists[currentIndex].splice(0, 1);
                    console.log('  lists:');
                    console.log(lists);
                    matchFound = true;
                }
            }
            currentIndex++;
        }

        if (!matchFound) {
            current = "";
            startNew = false;
        } else {
            startNew = true;
        }
    }
}

function merge2(lists) {
    let accumulator = [];

    let currentIndex = 0;
    let current = "";
    let startNew = false;
    for (; ;) {
        if (allEmpty(lists)) {
            break;
        }
        let matchFound = false;
        for (let i = 0; i < lists.length; i++) {
            if (currentIndex === lists.length) {
                currentIndex = 0;
            }

            if (lists[currentIndex].length) {
                if (current === "") {
                    current = lists[currentIndex][0];
                    accumulator.push(current);
                    lists[currentIndex].splice(0, 1);
                    matchFound = true;
                } else if (lists[currentIndex][0] === current && startNew) {
                    accumulator.push(current);
                    startNew = false;
                    lists[currentIndex].splice(0, 1);
                } else if (lists[currentIndex][0] === current) {
                    lists[currentIndex].splice(0, 1);
                    matchFound = true;
                }
            }
            currentIndex++;
        }

        if (!matchFound) {
            current = "";
            startNew = false;
        } else {
            startNew = true;
        }
    }

    return accumulator
}

console.log('Running merger');
let results = merge2(testData);
console.log('results', results);
