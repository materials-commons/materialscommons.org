class MCFileComponentController {
    /*@ngInject*/
    constructor(mcshow) {
        this.mcshow = mcshow;
        this.state = {
            file: null,
            isBetaUser: false,
        };
    }

    $onChanges(changes) {
        if (changes.file) {
            this.state.file = angular.copy(changes.file.currentValue);
        }

        if (changes.isBetaUser) {
            this.state.isBetaUser = changes.isBetaUser.currentValue;
        }
    }

    showJson() {
        this.mcshow.showJson(this.state.file);
    }

    handleRenameFile(name) {
        this.onRenameFile({name: name});
    }

    handleEtlFile(experimentName, hasParent) {
        this.onEtlFile({experimentName, hasParent});
    }
}

angular.module('materialscommons').component('mcFile', {
    template: require('./mc-file.html'),
    controller: MCFileComponentController,
    bindings: {
        file: '<',
        isBetaUser: '<',
        onRenameFile: '&',
        onEtlFile: '&',
    }
});

