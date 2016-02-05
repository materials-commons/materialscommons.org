(function (module) {
    module.controller('ProjectController', ProjectController);

    ProjectController.$inject = ["ui", "project", "current", "projectsService", "help", "gridFiles",
        "projects", "$window", "$timeout", "$scope"];

    /* @ngInject */
    function ProjectController(ui, project, current, projectsService, help, gridFiles,
                               projects, $window, $timeout, $scope) {
        var ctrl = this;

        current.setProject(project);
        ctrl.isExpanded = isExpanded;
        ctrl.showHelp = showHelp;
        ctrl.project = project;
        ctrl.projects = projects;
        ctrl.loaded = true;
        ctrl.windowHeight = $window.innerHeight - 86;

        $scope.$on('socket:connect', function(ev, data) {
            console.log('socket:connect');
        });

        $scope.$on('socket:reconnect', function() {
            console.log('socket:reconnect');
        });

        $scope.$on('socket:disconnect', function() {
            console.log('socket:disconnect');
        });

        $scope.$on('socket:error', function() {
            console.log('socket:error');
        });

        $scope.$on('socket:event', function(ev, data) {
            console.dir(data);
        });

        // set height of project content area dynamically.
        var w = angular.element($window);
        w.bind('resize', function () {
            $timeout(function () {
                ctrl.windowHeight = $window.innerHeight - 86;
            });
        });

        if (!project.files) {
            ctrl.loaded = false;
            projectsService.getProjectDirectory(project.id).then(function(files) {
                project.files = gridFiles.toGrid(files);
                ctrl.loaded = true;
            });
        }

        ////////////////////////////

        function isExpanded(what) {
            return help.isActive() && ui.isExpanded(project.id, what);
        }

        function showHelp() {
            return help.isActive();
        }
    }
}(angular.module('materialscommons')));