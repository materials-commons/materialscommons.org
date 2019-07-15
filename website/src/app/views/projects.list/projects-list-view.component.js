class MCProjectsListViewComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            query: '',
            user: null,
            projects: [],
        };
    }

    $onChanges(changes) {
        if (changes.user) {
            this.state.user = angular.copy(changes.user.currentValue);
        }

        if (changes.projects) {
            this.state.projects = angular.copy(changes.projects.currentValue);
        }
    }

    createNewProject() {
        this.onCreateProject();
    }

    createDemoProject() {
        this.onCreateDemoProject();
    }

    hideDemoProject() {
        this.onHideDemoProject();
    }

    refreshProjects() {
        this.onSync();
    }
}

angular.module('materialscommons').component('mcProjectsListView', {
    template: require('./projects-list-view.html'),
    controller: MCProjectsListViewComponentController,
    bindings: {
        projects: '<',
        user: '<',
        onCreateDemoProject: '&',
        onHideDemoProject: '&',
        onCreateProject: '&',
        onSync: '&'
    }
});