(function (module) {
    module.controller("newProjectModalController",newProjectModalController);
    newProjectModalController.$inject = ["mcapi", "model.projects", "current", "$state"];

    /* @ngInject */
    function newProjectModalController(mcapi, Projects, current, $state) {
        var ctrl = this;
        ctrl.name = "";
        ctrl.create = create;

        ////////////////

        function create () {
            if (ctrl.name === "") {
                return;
            }

            mcapi('/projects')
                .success(function (project) {
                    Projects.getList(true).then(function (projects) {
                        ctrl.name = "";
                        var i = _.indexOf(projects, function (p) {
                            return p.id == project.project_id;
                        });
                        setProject(projects[i]);
                    });
                }).post({'name': ctrl.name});
        }

        function setProject (project) {
            current.setProject(project);
            $state.go("projects.project.home", {id: project.id});
        }
    }
}(angular.module('materialscommons')));