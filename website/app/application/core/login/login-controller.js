(function (module) {
    module.controller('LoginController', LoginController);

    LoginController.$inject = ["$state", "User", "toastr",
        "mcapi", "model.projects",
        "$anchorScroll", "$location", "Restangular"];

    /* @ngInject */

    function LoginController($state, User, toastr, mcapi, projects, $anchorScroll, $location, Restangular) {
        var ctrl = this;

        ctrl.cancel = cancel;
        ctrl.gotoID = gotoID;
        ctrl.login = login;

        ////////////////////

        function login() {
            mcapi('/user/%/apikey', ctrl.email, ctrl.password)
                .success(function (u) {
                    User.setAuthenticated(true, u);
                    projects.clear();
                    Restangular.setDefaultRequestParams({apikey: User.apikey()});
                    projects.getList().then(function (projects) {
                        if (projects.length === 0) {
                            $state.go("projects.create");
                        } else {
                            $state.go('projects.project.home', {id: projects[0].id});
                        }
                    });
                })
                .error(function (reason) {
                    ctrl.message = "Incorrect Password/Username!";
                    toastr.error(reason.error, 'Error', {
                        closeButton: true
                    });
                }).put({password: ctrl.password});
        }

        function cancel() {
            $state.transitionTo('home');
        }

        function gotoID(id) {
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash(id);
            // call $anchorScroll()
            $anchorScroll();
        }
    }

}(angular.module('materialscommons')));
