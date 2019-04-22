class MCFileEditControlsComponentController {
    /*@ngInject*/
    constructor(mcfile, $mdDialog) {
        this.mcfile = mcfile;
        this.$mdDialog = $mdDialog;

        this.state = {
            file: null,
            newName: '',
            renameActive: false,
            isBetaUser: false,
            isExcelFile: false,
        };
    }

    $onChanges(changes) {
        if (changes.file) {
            this.state.file = angular.copy(changes.file.currentValue);
            this.state.newName = this.state.file.name;
            this.state.renameActive = false;
            this.state.isExcelFile = this.mcfile.isMSExcel(this.state.file.mediatype.mime);
        }

        if (changes.isBetaUser) {
            this.state.isBetaUser = changes.isBetaUser.currentValue;
        }
    }

    renameFile() {
        if (this.state.newName === '') {
            return;
        } else if (this.state.newName === this.state.file.name) {
            this.state.renameActive = false;
            return;
        }

        this.onRenameFile({name: this.state.newName});
    }

    downloadSrc() {
        return this.mcfile.downloadSrc(this.state.file.id);
    }

    handleEtlFile() {
        this.$mdDialog.show({
            templateUrl: 'app/modals/create-experiment-from-spreadsheet.html',
            controller: CreateExperimentFromSpreadsheetDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
        }).then(
            options => this.onEtlFile({experimentName: options.experimentName, hasParent: options.hasParent})
        );
    }
}

angular.module('materialscommons').component('mcFileEditControls', {
    template: require('./mc-file-edit-controls.html'),
    controller: MCFileEditControlsComponentController,
    bindings: {
        file: '<',
        isBetaUser: '<',
        onRenameFile: '&',
        onEtlFile: '&',
    }
});

class CreateExperimentFromSpreadsheetDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.state = {
            experimentName: '',
            hasParent: false,
        };
    }

    submit() {
        this.$mdDialog.hide(this.state);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}
