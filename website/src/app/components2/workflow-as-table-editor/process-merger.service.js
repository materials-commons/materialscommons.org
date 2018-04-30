class ProcessMergerService {
    /*@ngInject*/
    constructor() {

    }

    mergeProcessesForSamples(samples) {
        let processes = [];
        samples.forEach(s => {
            processes.push(s.processes.filter(p => p.process_type !== 'create').map(p => p.template_name));
        });

        return this._merger(processes);
    }

    _allEmpty(lists) {
        let isEmpty = true;
        lists.forEach(l => {
            if (l.length) {
                isEmpty = false;
            }
        });

        return isEmpty;
    }

    _merger(lists) {
        let accumulator = [];

        let currentIndex = 0;
        let current = "";
        let startNew = false;
        for (; ;) {
            if (this._allEmpty(lists)) {
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

    mergeProcessesForSamples2(samples) {
        let processes = [];
        samples.forEach(s => {
            processes.push(s.processes.filter(p => p.process_type !== 'create')
                .map(p => ({name: p.template_name, processes: [p.id]})));
        });

        return this._merger2(processes);
    }

    _merger2(lists) {
        console.log('_merger2', angular.copy(lists));
        let accumulator = [];

        let currentIndex = 0;
        let current = null;
        let startNew = false;
        for (; ;) {
            if (this._allEmpty(lists)) {
                break;
            }
            let matchFound = false;
            for (let i = 0; i < lists.length; i++) {
                if (currentIndex === lists.length) {
                    currentIndex = 0;
                }

                if (lists[currentIndex].length) {
                    if (current === null) {
                        current = angular.copy(lists[currentIndex][0]);
                        accumulator.push(current);
                        console.log('pushing current==null', current);
                        lists[currentIndex].splice(0, 1);
                        matchFound = true;
                    } else if (lists[currentIndex][0].name === current.name && startNew) {
                        console.log('lists[currentIndex][0].name === current.name && startNew', current);
                        accumulator.push(angular.copy(current));
                        startNew = false;
                        lists[currentIndex].splice(0, 1);
                        matchFound = true;
                    } else if (lists[currentIndex][0].name === current.name) {
                        current.processes = current.processes.concat(lists[currentIndex][0].processes);
                        lists[currentIndex].splice(0, 1);
                        matchFound = true;
                    }
                }
                currentIndex++;
            }

            if (!matchFound) {
                current = null;
                startNew = false;
            } else {
                startNew = true;
            }
        }

        return accumulator;
    }
}

angular.module('materialscommons').service('processMerger', ProcessMergerService);