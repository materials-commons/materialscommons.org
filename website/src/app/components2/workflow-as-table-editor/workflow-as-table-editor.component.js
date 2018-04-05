class MCWorkflowAsTableEditorComponentController {
    /*@ngInject*/
    constructor(mcshow) {
        this.mcshow = mcshow;
        this.grouped = false;
        this.editTable = false;
    }

    $onInit() {
        this.createDemoData();
    }

    createDemoData() {
        this.headers = [
            "Heat Treatment",
            "SEM",
            "Low Cycle Fatigue",
            "EBSD",
            "Tension",
            "EBSD",
            "TEM",
            "Cogging",
            "Tension",
            "EBSD",
            "TEM",
        ];

        this.samples = [];
        for (let i = 0; i < 10; i++) {
            this.samples.push({
                selected: false,
                name: "Sample_" + i,
                processes: this.fillRandomProcesses(this.headers.length)
            })
        }
    }

    fillRandomProcesses(count) {
        let processes = [];
        for (let i = 0; i < count; i++) {
            let rval = Math.floor(Math.random() * 2);
            if (rval) {
                processes.push({active: true, selected: true});
            } else {
                processes.push({active: false, selected: false});
            }
        }
        return processes;
    }

    handleDeleteSampleClick(index) {
        this.samples.splice(index, 1);
        this.samples = angular.copy(this.samples);
    }

    handleDeleteProcess(index) {
        this.headers.splice(index, 1);
        this.headers = angular.copy(this.headers);
    }

    handleUpdateStateOfProcessInSample(sampleIndex, processIndex, state) {
        this.samples[sampleIndex].processes[processIndex].selected = state;
        this.samples[sampleIndex].processes[processIndex].active = state;
    }

    finishEditingTable() {
        this.editTable = false;
        this.samples = angular.copy(this.samples);
    }

    handleSelectSample(sampleIndex, selectState) {
        this.samples[sampleIndex].selected = selectState;
    }

    handleRemoveSelectedSamples() {
        this.samples = this.samples.filter(s => !s.selected);
    }

    chooseExistingSamples() {
        this.mcshow.chooseSamplesFromProject().then(
            samplesChosen => {
                // TODO: Update headers using header determination algorithm with added samples
                // Once the algorithm for creating the headers is written then we need to
                // use that algorithm here to account for new samples
                this.samples = this.samples.concat(samplesChosen);
            }
        );
    }
}

angular.module('materialscommons').component('mcWorkflowAsTableEditor', {
    template: require('./workflow-as-table-editor.html'),
    controller: MCWorkflowAsTableEditorComponentController
});

// this.projectsAPI.getProjectSamples(this.project.id).then(
//     (samples) => {
//         this.samples = samples;
//         this.samples.forEach(s => this.addProcessListTimeLine(s));
//         let uniqueProcesses = this.computeUniqueProcesses();
//         this.createHeaders(uniqueProcesses);
//         //console.log('this.samples', samples);
//     }
// );
// addProcessListTimeLine(sample) {
//     let processes = _.indexBy(sample.processes, 'process_id');
//     sample.processesInTimeline = sample.processes.filter(
//         (p) => processes[p.process_id].property_set_id === p.property_set_id
//     ).filter(p => {
//         if (p.template_name == 'Create Samples') {
//             return false;
//         } else if (p.template_name == 'Sectioning') {
//             return false;
//         }
//
//         return true;
//     }).map(p => ({
//         name: p.template_name,
//         process_id: p.process_id,
//         seen: false
//     }));
// }
//
// computeUniqueProcesses() {
//     const allProcesses = [];
//     this.samples.forEach(s => allProcesses.push(s.processesInTimeline));
//     let combinedProcessTimeline = _.uniq([].concat.apply([], allProcesses), 'process_id');
//     let combinedProcessTimelineMap = _.indexBy(combinedProcessTimeline, 'process_id');
//     return {combinedProcessTimelineMap, combinedProcessTimeline};
// }
//
// createHeaders(uniqueProcesses) {
//     // uniqueProcesses.combinedProcessTimeline.forEach(p => {
//     //     //console.log(p.name);
//     // })
//     // let headers = [];
//     // let first = this.samples.processesInTimeline[0];
//     // for (let i = 1; i < this.samples.length; i++) {
//     //
//     // }
//      uniqueProcesses.combinedProcessTimeline.forEach(() => null);
// }