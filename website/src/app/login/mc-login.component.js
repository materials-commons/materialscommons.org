angular.module('materialscommons')
    .component('mcLogin', {
        template: require('./mc-login.html'),
        controller: MCLoginController
    });

/*@ngInject*/
function MCLoginController($state, User, toast, mcapi, Restangular, mcbus, templates, mcprojstore, mcRouteState) {
    const ctrl = this;

    ctrl.message = '';
    ctrl.userLogin = '';
    ctrl.password = '';
    ctrl.cancel = cancel;
    ctrl.login = login;
    ctrl.whichSite = 'published';

    ////////////////////

    function login() {
        mcapi('/user/%/apikey', ctrl.userLogin, ctrl.password)
            .success((u) => {
                User.setAuthenticated(true, u);
                Restangular.setDefaultRequestParams({apikey: User.apikey()});
                templates.getServerTemplates().then((t) => templates.set(t));
                let routeState = mcRouteState.getRoute();
                mcprojstore.reset().then(() => {
                    if (routeState.state !== null) {
                        $state.go(routeState.state.name, routeState.params);
                        mcRouteState.setRoute(null, null);
                    } else {
                        let route = ctrl.whichSite == 'published' ? 'data.home.top' : 'projects.list';
                        $state.go(route)
                    }
                });
                mcbus.send('USER$LOGIN');
            })
            .error((reason) => {
                ctrl.message = 'Incorrect Password or Username!';
                toast.error(reason.error);
            }).put({password: ctrl.password});
    }

    function cancel() {
        ctrl.userLogin = '';
        ctrl.password = '';
    }

}

