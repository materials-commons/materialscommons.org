class ProjectFilesView2ControlsComponentController {
    /*@ngInject*/
    constructor(mcFileOpsDialogs) {
        this.mcFileOpsDialogs = mcFileOpsDialogs;
        this.state = {
            directory: '',
            selectionOn: false,
            selectionType: '',
            query: ''
        };
    }

    $onChanges(changes) {
        if (changes.directory) {
            this.state.directory = changes.directory.currentValue;
        }
    }

    handleUploadFiles() {

    }

    handleCreateDirectory() {
        this.mcFileOpsDialogs.createDirectory(this.state.directory).then(path => this.onCreateDir({path: path}));
    }

    handleSelectFilesToDownload() {
        this.setSelectionStateOn('download');
    }

    handleSelectFilesToDelete() {
        this.setSelectionStateOn('delete');
    }

    handleSelectFilesToMove() {
        this.setSelectionStateOn('move');
    }

    handleSelectionDone() {
        this.setSelectionStateOff();
    }

    handleCancelSelection() {
        this.setSelectionStateOff();
    }

    setSelectionStateOn(selectionType) {
        this.state.selectionOn = true;
        this.state.selectionType = selectionType;
        this.onSelectionStateChange({state: true});
    }

    setSelectionStateOff() {
        this.state.selectionOn = false;
        this.state.selectionType = '';
        this.onSelectionStateChange({state: false});
    }

    handleFilterOn() {
        this.onFilterOn({filterOn: this.state.query});
    }

    handleClearFilter() {
        this.state.query = '';
        this.handleFilterOn();
    }
}

angular.module('materialscommons').component('mcProjectFilesView2Controls', {
    controller: ProjectFilesView2ControlsComponentController,
    template: require('./project-files-view2-controls.html'),
    bindings: {
        directory: '<',
        onSelectionStateChange: '&',
        onFilterOn: '&',
        onCreateDir: '&',
    }
});