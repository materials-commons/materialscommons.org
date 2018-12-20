class MCWorkflowAsTableEditorComponentController {
    /*@ngInject*/
    constructor(mcshow, processMerger) {
        this.mcshow = mcshow;
        this.processMerger = processMerger;
        this.grouped = false;
        this.editTable = false;
        this.state = {
            samples: [],
            headers: [],
            processes: [],
            grouped: false,
            editTable: false,
        };
    }

    $onInit() {

    }

    $onChanges(changes) {
        if (changes.samples) {
            this.state.samples = angular.copy(changes.samples.currentValue);
            this.state.samples.forEach(s => {
                s.selected = false;
                s.processes.filter(p => p.process_type !== 'create').map(p => {
                    p.active = true;
                    p.selected = true;
                    return p;
                });
                //s.processes = this.fillRandomProcesses(this.state.headers.length);
            });
            // this.state.processes = this.processMerger.mergeProcessesForSamples3(this.state.samples);
            // console.log('this.state.processes', this.state.processes);
            // this.state.headers = this.state.processes.map(p => p.name);
            // console.log('this.state.headers', this.state.headers);
        }

        if (changes.processes) {
            // this.state.processes = this.processMerger.mergeProcessesForSamples3(changes.processes.currentValue);
            this.state.processes = this.processMerger.mergeProcesses(changes.processes.currentValue);
            //console.log('this.state.processes', this.state.processes);
            this.state.headers = this.state.processes.map(p => p.template_name);
            this.state.samples.forEach(s => {
                s.headers = [];
                this.state.processes.forEach(p => {
                    let use = false;
                    if (_.findIndex(p.input_samples, sample => sample.id === s.id) !== -1) {
                        use = true;
                    }

                    s.headers.push({use: use});
                });
            });
            //console.log('this.state.headers', this.state.headers);
        }
    }

    handleDeleteSampleClick(index) {
        this.state.samples.splice(index, 1);
        this.state.samples = angular.copy(this.state.samples);
    }

    handleDeleteProcess(index) {
        let processesToToggle = {};
        this.state.processes[index].processes.forEach(id => processesToToggle[id] = true);
        this.state.samples.forEach(s => {
            s.processes = s.processes.filter(p => !(p.id in processesToToggle));
        });
        this.state.samples = angular.copy(this.state.samples);
        this.state.headers.splice(index, 1);
        this.state.headers = angular.copy(this.state.headers);
    }

    handleUpdateStateOfProcessInSample(sampleIndex, processIndex, state) {
        this.state.samples[sampleIndex].processes[processIndex].selected = state;
        this.state.samples[sampleIndex].processes[processIndex].active = state;
    }

    finishEditingTable() {
        this.state.editTable = false;
        this.state.samples = angular.copy(this.state.samples);
    }

    handleSelectSample(sampleIndex, selectState) {
        this.state.samples[sampleIndex].selected = selectState;
    }

    handleRemoveSelectedSamples() {
        this.state.samples = this.state.samples.filter(s => !s.selected);
    }

    chooseExistingSamples() {
        this.mcshow.chooseSamplesFromProject(this.state.samples).then(
            samplesChosen => {
                // TODO: Update headers using header determination algorithm with added samples
                // Once the algorithm for creating the headers is written then we need to
                // use that algorithm here to account for new samples
                this.state.samples = this.state.samples.concat(samplesChosen);
            }
        );
    }
}

angular.module('materialscommons').component('mcWorkflowAsTableEditor', {
    template: require('./workflow-as-table-editor.html'),
    controller: MCWorkflowAsTableEditorComponentController,
    bindings: {
        samples: '<',
        processes: '<',
    }
});