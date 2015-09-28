(function (module) {
    module.controller('ProjectController', ProjectController);

    ProjectController.$inject = ["ui", "project", "current", "mcapi", "help", "gridFiles", "projects"];

    /* @ngInject */
    function ProjectController(ui, project, current, mcapi, help, gridFiles, projects) {
        var ctrl = this;

        current.setProject(project);
        ctrl.isExpanded = isExpanded;
        ctrl.showHelp = showHelp;
        ctrl.project = project;
        ctrl.loaded = true;
        ctrl.projects = projects;

        if (!project.files) {
            ctrl.loaded = false;
            mcapi('/v2/projects/%/dir/top', project.id)
                .success(function (files) {
                    project.files = gridFiles.toGrid(files);
                    ctrl.loaded = true;
                })
                .error(function (err) {
                    console.log('error calling projects %O', err);
                }).get();
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