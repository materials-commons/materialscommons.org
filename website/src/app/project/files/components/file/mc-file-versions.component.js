class MCFileVersionsComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            versions: [],
        };
    }

    $onChanges(changes) {
        if (changes.versions) {
            this.state.versions = angular.copy(changes.versions.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcFileVersions', {
    controller: MCFileVersionsComponentController,
    template: require('./mc-file-versions.html'),
    bindings: {
        versions: '<'
    }
});