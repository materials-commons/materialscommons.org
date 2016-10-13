angular.module('materialscommons')
    .component('mcLogin', {
        templateUrl: 'app/login/mc-login.html',
        controller: MCLoginController
    });

/*@ngInject*/
function MCLoginController($state, User, toastr, mcapi, Restangular, loginSupportService) {
    var ctrl = this;

    ctrl.loginSupportService = loginSupportService;

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
                if (u.reset_password) ctrl.loginSupportService.clearPasswordResetRequest(u);
                if (u.default_project && u.default_project !== '' && u.default_experiment && u.default_experiment !== '') {
                    $state.go('project.experiment.tasks', {
                        project_id: u.default_project,
                        experiment_id: u.default_experiment
                    });
                } else if (u.default_project && u.default_project !== '') {
                    $state.go('project.home', {project_id: u.default_project});
                } else {
                    $state.go('projects.list');
                }
            })
            .error(function(reason) {
                ctrl.message = "Incorrect Password/Username!";
                toastr.error(reason.error, 'Error', {
                    closeButton: true
                });
            }).put({password: ctrl.password});
    }

    function cancel() {
        ctrl.userLogin = "";
        ctrl.password = "";
    }

}

