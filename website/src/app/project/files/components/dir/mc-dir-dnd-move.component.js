class MCDirDNDMoveComponentController {
    /*@ngInject*/
    constructor() {

    }

    onDrop(index, item) {
        return this.onMove({item: item});
    }
}

angular.module('materialscommons').component('mcDirDndMove', {
    templateUrl: 'app/project/files/components/dir/mc-dir-dnd-move.html',
    controller: MCDirDNDMoveComponentController,
    bindings: {
        moveFiles: '<',
        onMove: '&'
    }
});