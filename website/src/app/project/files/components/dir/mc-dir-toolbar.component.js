class MCDirToolbarComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcDirToolbar', {
    template: require('./mc-dir-toolbar.html'),
    controller: MCDirToolbarComponentController,
    require: {
        mcDir: '^mcDir'
    }
});
