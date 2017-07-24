angular.module('materialscommons').factory("processEdit", processEdit);

function processEdit() {
    return {
        addToSamplesFiles: function(files, process) {
            files.forEach(function(f) {
                let i = _.indexOf(process.samples_files, function(item) {
                    return f.id === item.id && f.sample_id == item.sample_id;
                });
                if (i !== -1) {
                    process.samples_files.splice(i, 1);
                    process.samples_files.push({
                        id: f.id,
                        command: f.command,
                        name: f.name,
                        sample_id: f.sample_id
                    });
                } else {
                    if (f.command) {
                        process.samples_files.push({
                            id: f.id,
                            command: f.command,
                            name: f.name,
                            sample_id: f.sample_id
                        });
                    }
                }
            });
            return process;
        },

        refreshSample: function(files, sample) {
            files.forEach(function(f) {
                if (f.command) {
                    let i = _.indexOf(sample.files, function(item) {
                        return f.id === item.id && f.sample_id == sample.id;
                    });
                    if (i !== -1) {
                        sample.files.splice(i, 1);
                        sample.files.push({
                            id: f.id,
                            command: f.command,
                            name: f.name,
                            sample_id: f.sample_id,
                            linked: f.linked
                        });
                    } else {
                        sample.files.push({
                            id: f.id,
                            command: f.command,
                            name: f.name,
                            sample_id: f.sample_id,
                            linked: f.linked
                        });
                    }
                }
            });
            return sample;
        }
    };
}
