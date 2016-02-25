(function(module) {
    module.factory('processSelections', processSelectionsService);
    processSelectionsService.$inject = ['selectItems'];
    function processSelectionsService(selectItems) {
        return {
            selectSamples: function(processSamples) {
                selectItems.open('samples').then(function (item) {
                    var uniqueSamples = differenceById(item.samples, processSamples);
                    uniqueSamples.forEach(function (sample) {
                        processSamples.push({
                            id: sample.id,
                            name: sample.name,
                            old_properties: [],
                            new_properties: [],
                            property_set_id: sample.property_set_id,
                            files: []
                        });
                    });
                });
            },

            selectFiles: function(processFiles) {
                selectItems.open('files').then(function (item) {
                    var uniqueFiles = differenceById(item.files, processFiles);
                    uniqueFiles.forEach(function (file) {
                        processFiles.push({
                            id: file.id,
                            name: file.name,
                            mediatype: file.mediatype
                        });
                    });
                });
            }
        }
    }
}(angular.module('materialscommons')));
