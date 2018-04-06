class MCDirDNDMoveComponentController {
    /*@ngInject*/
    constructor() {

    }

    onDrop(index, item) {
        return this.onMove({item: item});
    }
}

angular.module('materialscommons').component('mcDirDndMove', {
    template: require('./mc-dir-dnd-move.html'),
    controller: MCDirDNDMoveComponentController,
    bindings: {
        moveFiles: '<',
        onMove: '&'
    }
});
