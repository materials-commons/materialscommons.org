(function (module) {
    module.controller('ProjectController', ProjectController);

    ProjectController.$inject = ["ui", "project", "current", "Restangular", "help", "gridFiles",
        "projects", "$window", "$timeout"];

    /* @ngInject */
    function ProjectController(ui, project, current, Restangular, help, gridFiles, projects, $window, $timeout) {
        var ctrl = this;

        current.setProject(project);
        ctrl.isExpanded = isExpanded;
        ctrl.showHelp = showHelp;
        ctrl.project = project;
        ctrl.projects = projects;
        ctrl.loaded = true;
        ctrl.windowHeight = $window.innerHeight - 86;

        // set height of project content area dynamically.
        var w = angular.element($window);
        w.bind('resize', function() {
            $timeout(function() {
                ctrl.windowHeight = $window.innerHeight - 86;
            });
        });

        if (!project.files) {
            ctrl.loaded = false;
            Restangular.one('v2').one('projects', project.id).one('directories').get().then(function(files) {
                    project.files = gridFiles.toGrid(files);
                    ctrl.loaded = true;
                }).catch(function(err) {
                    console.log('error calling projects %O', err);
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