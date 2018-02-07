class MCProjectSettingsComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcProjectSettings', {
    template: require('./mc-project-settings.html'),
    controller: MCProjectSettingsComponentController
});