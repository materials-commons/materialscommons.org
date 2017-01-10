angular.module('materialscommons').factory('processSelections', processSelectionsService);

function processSelectionsService(selectItems, differenceById) {
    'ngInject';
    return {
        selectSamples: function(processSamples) {
            selectItems.samples([]).then(function (item) {
                var uniqueSamples = differenceById(item.samples, processSamples);
                uniqueSamples.forEach(function(sample) {
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

        selectUpdatedSamples: function(processSamples, updatedSamples) {
            selectItems.samples([]).then(function (item) {
                var uniqueSamples = differenceById(item.samples, processSamples);
                uniqueSamples.forEach(function(sample) {
                    processSamples.push({
                        id: sample.id,
                        name: sample.name,
                        old_properties: [],
                        new_properties: [],
                        property_set_id: sample.property_set_id,
                        files: []
                    });
                    updatedSamples.push({
                        id: sample.id,
                        command: 'add',
                        property_set_id: sample.property_set_id
                    });
                });
            });
        },

        selectFiles: function(processFiles) {
            selectItems.fileTree().then(function (item) {
                var uniqueFiles = differenceById(item.files, processFiles);
                uniqueFiles.forEach(function(file) {
                    processFiles.push({
                        id: file.id,
                        name: file.name,
                        mediatype: file.mediatype
                    });
                });
            });
        },

        selectUpdatedFiles: function(processFiles, updatedFiles) {
            selectItems.fileTree().then(function (item) {
                var uniqueFiles = differenceById(item.files, processFiles);
                uniqueFiles.forEach(function(file) {
                    processFiles.push({
                        id: file.id,
                        name: file.name,
                        mediatype: file.mediatype
                    });
                    updatedFiles.push({id: file.id, command: 'add'});
                });
            });
        }
    }
}
