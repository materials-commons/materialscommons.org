angular.module('materialscommons')
    .component('mcLogin', {
        template: require('./mc-login.html'),
        controller: MCLoginController
    });

/*@ngInject*/
function MCLoginController($state, User, toast, mcapi, Restangular, mcbus, templates, mcprojstore) {
    const ctrl = this;

    ctrl.message = "";
    ctrl.userLogin = "";
    ctrl.password = "";
    ctrl.cancel = cancel;
    ctrl.login = login;

    ////////////////////

    function login() {
        mcapi('/user/%/apikey', ctrl.userLogin, ctrl.password)
            .success((u) => {
                User.setAuthenticated(true, u);
                Restangular.setDefaultRequestParams({apikey: User.apikey()});
                templates.getServerTemplates().then((t) => templates.set(t));
                mcprojstore.reset().then(() => $state.go('data.home.top'));
                mcbus.send('USER$LOGIN');
            })
            .error((reason) => {
                ctrl.message = 'Incorrect Password orUsername!';
                toast.error(reason.error);
            }).put({password: ctrl.password});
    }

    function cancel() {
        ctrl.userLogin = "";
        ctrl.password = "";
    }

}

