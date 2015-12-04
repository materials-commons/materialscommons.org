(function (module) {
    module.factory('filterProcess', filterProcessService);
    filterProcessService.$inject = [];

    function filterProcessService() {

        function filterBySample(process, searchText) {
            for (var i = 0; i < process.samples.length; i++) {
                var sample = process.samples[i];
                if (sample.name.toLowerCase().indexOf(searchText) !== -1) {
                    return true;
                } else if (sample.description && sample.description.toLowerCase().indexOf(searchText) !== -1) {
                    return true;
                }
            }
            return false;
        }

        function filterByProcess(process, searchText) {
            if (process.name.toLowerCase().indexOf(searchText) !== -1) {
                return true;
            } else if (process.what.toLowerCase().indexOf(searchText) !== -1) {
                return true;
            } else if (process.why.toLowerCase().indexOf(searchText) !== -1) {
                return true;
            } else if (process.setup.length && process.setup[0].properties.length) {
                for (var i = 0; i < process.setup[0].properties.length; i++) {
                    var item = process.setup[0].properties[i];
                    if (item.name.toLowerCase().indexOf(searchText) !== -1) {
                        return true;
                    } else if (item._type === 'selection' && item.value !== "") {
                        if (item.value.name && item.value.name.toLowerCase().indexOf(searchText) !== -1) {
                            return true;
                        } else if (!item.value.name && item.value.toLowerCase().indexOf(searchText) !== -1) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        return {
            byAll: function (process, searchText) {
                if (filterByProcess(process, searchText)) {
                    return true;
                }
                return filterBySample(process, searchText);
            },
            bySample: filterBySample,
            byProcess: filterByProcess
        };
    }
}(angular.module('materialscommons')));
