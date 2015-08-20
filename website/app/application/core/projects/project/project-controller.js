(function (module) {
    module.controller('ProjectController', ProjectController);

    ProjectController.$inject = ["ui", "project", "current", "projectFiles",
        "mcapi", "help", "projects"];

    /* @ngInject */
    function ProjectController(ui, project, current, projectFiles, mcapi, help, projects) {
        var ctrl = this;

        current.setProject(project);

        ctrl.isExpanded = isExpanded;
        ctrl.projects = projects;
        ctrl.showHelp = showHelp;
        ctrl.project = project;
        ctrl.loaded = true;
        ctrl.projects = projects;

        if (!(project.id in projectFiles.model.projects)) {
            ctrl.loaded = false;
            mcapi("/projects/%/tree2", project.id)
                .success(function (files) {
                    var obj = {};
                    obj.dir = files[0];
                    projectFiles.model.projects[project.id] = obj;
                    ctrl.loaded = true;
                }).jsonp();
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