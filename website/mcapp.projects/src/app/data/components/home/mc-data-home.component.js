class MCDataHomeComponentController {
    /*@ngInject*/
    constructor(mcbus) {
        this.mcbus = mcbus;
        this.query = '';
    }

    search() {
        this.mcbus.send('MCDATA$SEARCH', this.query);
    }
}

angular.module('materialscommons').component('mcDataHome', {
    templateUrl: 'app/data/components/home/mc-data-home.html',
    controller: MCDataHomeComponentController,
    bindings: {
        tags: '<'
    }
});
