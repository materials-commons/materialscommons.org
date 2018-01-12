class MCProjectSidenavComponentController {
    /*@ngInject*/
    constructor($state) {
        this.$state = $state;
    }
}

angular.module('materialscommons').component('mcProjectSidenav', {
    template: require('./mc-project-sidenav.html'),
    controller: MCProjectSidenavComponentController
});
