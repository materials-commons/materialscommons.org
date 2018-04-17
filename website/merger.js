#!/usr/bin/env node

function allEmpty(lists) {
    let isEmpty = true;
    lists.forEach(l => {
        if (l.length) {
            isEmpty = false;
        }
    });

    return isEmpty;
}

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
                    matchFound = true;
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

let testData1 = [
    ['a', 'a', 'b', 'c'],
    ['a', 'c', 'a', 'a'],
    ['c', 'a', 'a', 'b'],
    ['a', 'c', 'c', 'g']
];

console.log('Running merger against:');
console.log(testData1);
let results = merge2(testData1);
console.log('results', results);

let testData2 = [
    ['a', 'b'],
    ['c', 'a'],
];
console.log('Running merger against:');
console.log(testData2);
results = merge2(testData2);
console.log('results', results);

let testData2Reverse = [
    ['c', 'a'],
    ['a', 'b'],
];
console.log('Running merger against:');
console.log(testData2Reverse);
results = merge2(testData2Reverse);
console.log('results', results);

let testData3 = [
    ['a', 'a', 'a'],
    ['b', 'a', 'b']
];
console.log('Running merger against:');
console.log(testData3);
results = merge2(testData3);
console.log('results', results);

let testData4 = [
    ['a', 'c', 'a', 'a'],
    ['a', 'a', 'b', 'c'],
    ['c', 'a', 'a', 'b'],
    ['a', 'c', 'c', 'g'],
];

console.log('Running merger against:');
console.log(testData4);
results = merge2(testData4);
console.log('results', results);

let testData5 = [
    ['a', 'c', 'a', 'a'],
    ['a', 'a', 'b', 'c'],
    ['c', 'a', 'a', 'b', 'b'],
    ['b', 'c', 'c', 'g'],
];

console.log('Running merger against:');
console.log(testData5);
results = merge2(testData5);
console.log('results', results);

let testDataFromSlides = [
    ['a', 'a', 'b', 'c', 'a', 'g', 'c', 'f'],
    ['a', 'c', 'a', 'a', 'c', 'a', 'f', 'a'],
    ['c', 'a', 'a', 'b', 'b', 'g', 'f', 'g'],
    ['a', 'c', 'c', 'g', 'g', 'a', 'a', 'f']
];

console.log('Running merger against:');
console.log(testDataFromSlides);
results = merge2(testDataFromSlides);
console.log('results', results);