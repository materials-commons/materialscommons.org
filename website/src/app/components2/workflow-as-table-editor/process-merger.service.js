class ProcessMergerService {
    /*@ngInject*/
    constructor() {

    }

    mergeProcessesForSamples(samples) {
        let processes = [];
        samples.forEach(s => {
            processes.push(s.processes.map(p => p.template_name));
        });

        return this._merger(processes);
    }

    _merger(lists) {
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

        return accumulator;
    }
}

angular.module('materialscommons').service('processMerger', ProcessMergerService);