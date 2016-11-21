angular.module('materialscommons').directive('navbar', navbarDirective);

function navbarDirective() {
    return {
        restrict: 'E',
        bindToController: true,
        replace: true,
        templateUrl: 'app/global.components/navbar.html',
        controller: NavbarDirectiveController,
        controllerAs: 'ctrl'
    };
}

/*@ngInject*/
function NavbarDirectiveController(User, $state, modelProjects, $stateParams, searchQueryText, project, navbarOnChange, projectsService) {
    var ctrl = this;

    var inProjectsState = $state.includes('projects');
    ctrl.$stateParams = $stateParams;

    searchQueryText.setOnChange(() => {
        ctrl.query = searchQueryText.get();
    });

    ctrl.project = null;

    navbarOnChange.setOnChange(() => {
        // Hack, change this later
        if ($stateParams.project_id) {
            projectsService.getProject($stateParams.project_id).then((proj) => project.set(proj));
        }
    });

    project.setOnChange(() => {
        ctrl.project = project.get();
        ctrl.published = ctrl.project.datasets.filter(d => d.published);
        ctrl.unusedSamples = ctrl.project.samples.filter(s => s.processes.length === 1);
        ctrl.measuredSamples = ctrl.project.samples.filter(s => s.processes.length > 1);
    });

    ctrl.query = searchQueryText.get();
    ctrl.placeholder = inProjectsState ? 'SEARCH PROJECTS...' : 'SEARCH PROJECT...';

    ctrl.toggleHelp = help;
    ctrl.search = search;
    ctrl.home = home;
    ctrl.logout = logout;
    ctrl.user = User.u();

    ////////////////////////

    function help() {

    }

    function search() {
        if (ctrl.query != '') {
            $state.go('project.search', {query: ctrl.query}, {reload: true});
        }
    }

    function home() {
        $state.go('projects');
    }

    function logout() {
        User.setAuthenticated(false);
        modelProjects.clear();
        $state.go('login');
    }
}

