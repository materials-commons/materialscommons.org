angular.module('materialscommons')
    .component('mcLogin', {
        templateUrl: 'app/login/mc-login.html',
        controller: MCLoginController
    });

/*@ngInject*/
function MCLoginController($state, User, toast, mcapi, Restangular, mcbus, templates) {
    const ctrl = this;

    ctrl.message = "";
    ctrl.userLogin = "";
    ctrl.password = "";
    ctrl.cancel = cancel;
    ctrl.login = login;

    ////////////////////

    function login() {
        mcapi('/user/%/apikey', ctrl.userLogin, ctrl.password)
            .success(function(u) {
                User.setAuthenticated(true, u);
                Restangular.setDefaultRequestParams({apikey: User.apikey()});
                templates.getServerTemplates().then(
                    (t) => templates.set(t)
                );
                if (u.default_project && u.default_project !== '' && u.default_experiment && u.default_experiment !== '') {
                    $state.go('project.experiment.workflow', {
                        project_id: u.default_project,
                        experiment_id: u.default_experiment
                    });
                } else if (u.default_project && u.default_project !== '') {
                    $state.go('project.home', {project_id: u.default_project});
                } else {
                    $state.go('projects.list');
                }
                mcbus.send('USER$LOGIN');
            })
            .error(function(reason) {
                ctrl.message = "Incorrect Password/Username!";
                toast.error(reason.error);
            }).put({password: ctrl.password});
    }

    function cancel() {
        ctrl.userLogin = "";
        ctrl.password = "";
    }

}

