class MCDirDNDMoveComponentController {
    /*@ngInject*/
    constructor() {

    }

    $onInit() {
        this.moveFiles = false;
    }
}

angular.module('materialscommons').component('mcDirDndMove', {
    templateUrl: 'app/project/files/components/dir/mc-dir-dnd-move.html',
    controller: MCDirDNDMoveComponentController,
    bindings: {}
});