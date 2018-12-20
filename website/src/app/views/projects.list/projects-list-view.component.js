class MCProjectsListViewComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            query: '',
            user: null,
            myProjects: [],
            joinedProjects: [],
        };
    }

    $onChanges(changes) {
        if (changes.user) {
            this.state.user = angular.copy(changes.user.currentValue);
        }

        if (changes.projects) {
            let projects = changes.projects.currentValue;
            this.state.myProjects = projects.filter(p => p.owner === this.state.user.email);
            this.state.joinedProjects = projects.filter(p => p.owner !== this.state.user.email);
        }
    }

    createNewProject() {
        this.onCreateProject();
    }

    createDemoProject() {
        this.onCreateDemoProject();
    }

    hideDemoProjectButton() {
        this.onHideCreateDemoProject();
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
        onHideCreateDemoProject: '&',
        onCreateProject: '&',
        onSync: '&'
    }
});