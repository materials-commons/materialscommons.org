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

function merger(lists) {
    let accumulator = [];

    let currentIndex = 0;
    for (; ;) {
        console.log('lists', lists);
        console.log('accumulator', accumulator);
        if (allEmpty(lists)) {
            break;
        }
        let foundSecond = false;
        let current = "";
        for (let iteration = 0; iteration < 2; iteration++) {
            for (let i = 0; i < lists.length; i++) {
                if (currentIndex === lists.length) {
                    currentIndex = 0;
                }

                if (lists[currentIndex].length) {
                    if (current === "") {
                        current = lists[currentIndex][0];
                        console.log('setting current to:', current);
                        accumulator.push(current);
                        lists[currentIndex].splice(0, 1);
                    } else if (lists[currentIndex][0] === current && iteration === 0) {
                        lists[currentIndex].splice(0, 1);
                    } else if (lists[currentIndex][0] === current && iteration === 1) {
                        accumulator.push(current);
                        lists[currentIndex].splice(0, 1);
                        foundSecond = true;
                        currentIndex++;
                        break;
                    }
                }
                currentIndex++;
            }
            if (foundSecond) {
                break;
            }
        }
    }

    return accumulator;
}

console.log('Running merger');
let results = merger(testData);
console.log('results');
