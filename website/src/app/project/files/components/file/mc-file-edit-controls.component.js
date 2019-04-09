class MCFileEditControlsComponentController {
    /*@ngInject*/
    constructor(mcfile) {
        this.mcfile = mcfile;

        this.state = {
            file: null,
            newName: '',
            renameActive: false,
        };
    }

    $onChanges(changes) {
        if (changes.file) {
            this.state.file = angular.copy(changes.file.currentValue);
            this.state.newName = this.state.file.name;
            this.state.renameActive = false;
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
}

angular.module('materialscommons').component('mcFileEditControls', {
    template: require('./mc-file-edit-controls.html'),
    controller: MCFileEditControlsComponentController,
    bindings: {
        file: '<',
        onRenameFile: '&'
    }
});
