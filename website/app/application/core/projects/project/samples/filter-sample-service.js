(function (module) {
    module.factory('filterSample', filterSampleService);
    filterSampleService.$inject = [];

    function filterSampleService() {

        function filterByProcess(sample, searchText) {
            for (var i = 0; i < sample.processes.length; i++) {
                var process = sample.processes[i];
                if (process.name.toLowerCase().indexOf(searchText) !== -1) {
                    return true;
                } else if (process.what && process.what.toLowerCase().indexOf(searchText) !== -1) {
                    return true;
                } else if (process.why && process.why.toLowerCase().indexOf(searchText) !== -1) {
                    return true;
                }
            }
            return false;
        }

        function filterBySample(sample, searchText) {
            if (sample.name.toLowerCase().indexOf(searchText) !== -1) {
                return true;
            } else if (sample.description.toLowerCase().indexOf(searchText) !== -1) {
                return true;
            }
            return false;
        }

        return {
            byAll: function (sample, searchText) {
                if (filterByProcess(sample, searchText)) {
                    return true;
                }
                return filterBySample(sample, searchText);
            },
            bySample: filterBySample,
            byProcess: filterByProcess
        };
    }
}(angular.module('materialscommons')));

