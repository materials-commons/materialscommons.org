angular.module('materialscommons').factory('prepareCreatedSample', prepareCreatedSampleService);
function prepareCreatedSampleService(processEdit) {
    'ngInject';

    return {
        filloutComposition: function(sample, compositionElements) {
            if (compositionElements.value.length) {
                var composition = compositionElements.value.map(function(c) {
                    return {
                        element: c.element,
                        value: c.value
                    };
                });
                var measurement = {
                    name: 'Composition',
                    attribute: 'composition',
                    measurements: [
                        {
                            is_best_measure: true,
                            value: composition,
                            unit: compositionElements.unit,
                            otype: 'composition'
                        }
                    ]
                };
                sample.new_properties.push(measurement);
            }
        },

        setupSampleGroup: function(sample, isGroup, sizingType, groupSize) {
            sample.has_group = isGroup;
            if (sizingType == 'set-size') {
                sample.group_size = groupSize;
            } else {
                sample.group_size = 0;
            }
        },

        addSampleInputFiles: function(sample, processInputFiles) {
            var linkedFiles = processInputFiles.map(function(f) {
                return {
                    id: f.id,
                    command: 'add',
                    name: f.name,
                    sample_id: ""
                }
            });
            processEdit.refreshSample(linkedFiles, sample);
        }
    }
}
