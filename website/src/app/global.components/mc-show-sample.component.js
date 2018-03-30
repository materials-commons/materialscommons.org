class MCShowSampleComponentController {
    /*@ngInject*/
    constructor($stateParams, samplesAPI, toast, $mdDialog) {
        this.projectId = $stateParams.project_id;
        this.samplesAPI = samplesAPI;
        this.toast = toast;
        this.$mdDialog = $mdDialog;
        this.viewHeight = this.viewHeight ? this.viewHeight : "40vh";
    }

    $onInit() {
        this.samplesAPI.getProjectSample(this.projectId, this.sampleId)
            .then(
                (sample) => this.processSample(sample),
                () => this.toast.error('Unable to retrieve sample')
            )
    }

    showProcess(process) {
        this.$mdDialog.show({
            templateUrl: 'app/modals/show-process-dialog.html',
            controllerAs: '$ctrl',
            controller: ShowProcessDialogController,
            bindToController: true,
            multiple: true,
            locals: {
                process: process
            }
        });
    }

    processSample(sample) {
        this.sample = sample;

        // Create a list of unique processes. Some processes will appear twice if the sample was both an
        // input and output. Here we show processes once by storing all processes in a map indexed by their
        // id. This means that each process will only appear once. Then we filter the list to keep the order
        // by only returning processes we find that have the same property_set_id (processes that have both an
        // input and output will be associated with a different property_set_id).
        let processes = _.indexBy(this.sample.processes, 'process_id');
        this.sample.processesInTimeline = this.sample.processes.filter(
            (p) => processes[p.process_id].property_set_id === p.property_set_id
        );
    }
}

class ShowProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcShowSample', {
    template: require('./mc-show-sample.html'),
    controller: MCShowSampleComponentController,
    bindings: {
        sampleId: '<'
    }
});
