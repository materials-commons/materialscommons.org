angular.module('materialscommons').directive('selectItemsSamples', selectItemsSamplesDirective);
function selectItemsSamplesDirective() {
    return {
        restrict: 'E',
        scope: {
            samples: '=',
            options: '='
        },
        controller: SelectItemsSamplesDirectiveController,
        controllerAs: 'ctrl',
        bindToController: true,
        template: require('./select-items-samples.html')
    }
}

/*@ngInject*/
function SelectItemsSamplesDirectiveController($mdDialog, mcstate) {
    const ctrl = this;

    this.singleSelection = false;

    ctrl.selectedProcess = mcstate.get(mcstate.SELECTED$PROCESS);
    if (ctrl.selectedProcess !== null) {
        ctrl.processFilter = ctrl.selectedProcess.id;
    } else {
        ctrl.processFilter = '';
    }

    ctrl.selected = [];
    ctrl.toggleSampleSelected = toggleSampleSelected;
    ctrl.onChange = onChange;
    ctrl.showProcess = showProcess;
    ctrl.toggleAllSamples = toggleAllSamples;
    ctrl.showAllProcesses = false;

    if (ctrl.options.showAllSamples) {
        ctrl.showAllProcesses = true;
        ctrl.processFilter = '';
    }

    ctrl.itemSelected = false;

    ctrl.samples.forEach(s => {
        s.selected = false;
        s.versions.forEach(v => {
            v.selected = false;
        });
    });

    ////////////////////////

    function toggleSampleSelected(sample) {
        sample.selected = !sample.selected;
    }

    function toggleAllSamples() {
        if (ctrl.showAllProcesses) {
            ctrl.processFilter = null;
        } else {
            ctrl.processFilter = ctrl.selectedProcess.id;
        }
    }

    function onChange(selected) {
        if (ctrl.options.singleSelection) {
            ctrl.itemSelected = selected;
        }
    }

    function showProcess(process) {
        $mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/show-process-dialog.html',
            controllerAs: '$ctrl',
            controller: ShowProcessDialogController,
            bindToController: true,
            multiple: true,
            locals: {
                process: process,
                showInputSamples: false,
                showOutputSamples: true
            }
        });
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



