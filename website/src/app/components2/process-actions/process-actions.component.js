class MCProcessActionsComponentController {
    /*@ngInject*/
    constructor(selectItems) {
        this.selectItems = selectItems;

        this.state = {
            createSampleName: '',
            process: null,
            items: [
                {
                    action: 'create',
                    kind: 'sample',
                    files: [],
                    samples: [],
                }
            ],
        };
    }

    $onChanges(changes) {
        if (changes.process) {
            this.state.process = angular.copy(changes.process.currentValue);
            console.log('process', this.state.process);
            this.state.createSampleName = '';
            if (this.state.process.samples.length || this.state.process.files.length) {
                this.state.items = [];
                this.buildExistingActions();
            }
        }
    }

    buildExistingActions() {
        this.buildExistingSamplesActions();
        this.buildExistingFilesActions();
    }

    buildExistingSamplesActions() {
        // Map the in/out direction for the samples. Samples will either appear once with a direction of
        // in (use sample) or out (create sample). If a sample appears twice then one of the version has
        // a in direction and the other an our direction. These are transformed samples. The code below
        // is for consolidating samples to a particular set of directions.
        let sampleStates = {};
        this.state.process.samples.forEach(s => {
            if (!_.has(sampleStates, s.sample_id)) {
                sampleStates[s.sample_id] = {
                    action: s.direction === 'out' ? 'create' : 'use',
                    name: s.name,
                };
            } else {
                // We have already seen this sample. If a sample appears twice then it must be
                // a sample that is transformed.
                sampleStates[s.sample_id].action = 'transform';
            }
        });

        // Now that we have all sample directions fill out the items list to contain these
        // entries.
        _.values(sampleStates).forEach(s => {
            this.state.items.push({
                action: s.action,
                kind: 'sample',
                samples: [s],
                files: [],
            });
        });
    }

    buildExistingFilesActions() {
        this.state.process.files.forEach(f => {
            this.state.items.push({
                action: this.mapFileDirectionToAction(f.direction),
                kind: 'file',
                samples: [],
                files: [f],
            });
        });
    }

    mapFileDirectionToAction(direction) {
        switch (direction) {
            case 'in':
                return 'use';
            case 'out':
                return 'create';
            default:
                // direction should be blank, default to use
                return 'use';
        }
    }

    addNewAction() {
        this.state.items.push({
            action: 'create',
            kind: 'sample',
            item: '',
            files: [],
            samples: [],
        });
    }

    delete(index) {
        if (index === 0) {
            this.state.items[0].action = 'create';
            this.state.items[0].kind = 'sample';
            this.state.items[0].files.length = 0;
            this.state.items[0].samples = [];
        } else {
            this.state.items.splice(index, 1);
        }
    }

    addCreateSample(item) {
        if (this.state.createSampleName !== '') {
            this.onCreateSample({sample: this.state.createSampleName});
            item.samples.push({name: angular.copy(this.state.createSampleName)});
            this.state.createSampleName = '';
        }
    }

    selectFiles(item) {
        this.onSelectFiles().then(selected => {
            console.log('selected files =', selected.files);
            item.files = [];
            selected.files.forEach(file => {
                item.files.push(file);
            });
        });
    }

    selectSamples(item) {
        this.onSelectSamples().then(selected => {
            item.samples = [];
            selected.samples.forEach(sample => {
                sample.versions.filter(s => s.selected).forEach(s => {
                    // Name in versions is the process name, we want the sample name
                    console.log('s', s);
                    s.name = sample.name;
                    item.samples.push(s);
                });
            });
            let samples = item.samples.map(s => ({sample_id: s.sample_id, property_set_id: s.property_set_id}));
            return this.onAddSamples({samples, transform: item.action === 'transform'});
        });
    }

}

angular.module('materialscommons').component('mcProcessActions', {
    controller: MCProcessActionsComponentController,
    template: require('./process-actions.html'),
    bindings: {
        process: '<',
        onSelectSamples: '&',
        onSelectFiles: '&',
        onCreateSample: '&',
        onDeleteSample: '&',
        onAddSamples: '&',
        onAddFile: '&',
        onDeleteFile: '&',
    }
});