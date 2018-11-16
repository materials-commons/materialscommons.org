class MCProjectSidenavComponentController {
    /*@ngInject*/
    constructor(mcRouteState, User, sidenavGlobus) {
        this.mcRouteState = mcRouteState;
        this.User = User;
        this.sidenavGlobus = sidenavGlobus;

        this.state = {
            project: null,
            experiment: null,
            files: null,
        };
    }

    $onInit() {
        this.isBetaUser = this.User.isBetaUser();
    }

    $onChanges(changes) {
        if (changes.project) {
            this.state.project = angular.copy(changes.project.currentValue);
            console.log('this.state.project', this.state.project);
        }
    }

    refreshProject() {
        this.onSync();
    }

    startGlobusDownload() {
        this.sidenavGlobus.globusDownload(this.project)
    }

    setupGlobusUpload() {
        this.sidenavGlobus.globusUpload(this.project);
    }

    modifyShortcuts() {
        this.onModifyShortcuts();
    }

    isDatasetsRoute() {
        return this.mcRouteState.getRouteName().startsWith('project.experiment.datasets');
    }

    isProjectDatasetsRoute() {
        return this.mcRouteState.getRouteName().startsWith('project.datasets');
    }
}

angular.module('materialscommons').component('mcProjectSidenav', {
    template: require('./mc-project-sidenav.html'),
    controller: MCProjectSidenavComponentController,
    bindings: {
        project: '<',
        onSync: '&',
        onModifyShortcuts: '&'
    }
});
