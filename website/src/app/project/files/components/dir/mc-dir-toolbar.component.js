class MCDirToolbarComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcDirToolbar', {
    templateUrl: 'app/project/files/components/dir/mc-dir-toolbar.html',
    controller: MCDirToolbarComponentController,
    require: {
        mcDir: '^mcDir'
    }
});