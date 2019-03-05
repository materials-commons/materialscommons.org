angular.module('materialscommons')
    .component('mcLogin', {
        template: require('./mc-login.html'),
        controller: MCLoginController
    });

/*@ngInject*/
function MCLoginController($state, User, toast, Restangular, mcbus, templates, mcprojstore) {
    const ctrl = this;

    ctrl.message = "";
    ctrl.userLogin = "";
    ctrl.password = "";
    ctrl.cancel = cancel;
    ctrl.login = login;
    ctrl.whichSite = 'published';

    ////////////////////

    function login() {
        Restangular.one('v3').one('login').customPOST({
            user_id: ctrl.userLogin,
            password: ctrl.password,
        }).then(
            u => {
                let user = u.plain().data;
                User.setAuthenticated(true, user);
                Restangular.setDefaultRequestParams({apikey: User.apikey()});
                templates.getServerTemplates().then((t) => templates.set(t));
                let route = ctrl.whichSite == 'published' ? 'data.home.top' : 'projects.list';
                mcprojstore.reset().then(() => $state.go(route));
                mcbus.send('USER$LOGIN');
            },
            (e) => {
                ctrl.message = 'Incorrect Password or Username!';
                toast.error(`${e.data.error}: ${ctrl.message}`);
            }
        );
    }

    function cancel() {
        ctrl.userLogin = "";
        ctrl.password = "";
    }

}