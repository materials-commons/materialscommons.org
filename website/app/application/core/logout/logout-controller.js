Application.Controllers.controller('logout',
    ["$rootScope", "$state", "$cookieStore", "User", "Projects", "ProvDrafts", "model.Projects",
        function ($rootScope, $state, $cookieStore, User,  Projects, ProvDrafts, P2) {
            $rootScope.email_address = '';
            $cookieStore.remove('mcuser');
            User.setAuthenticated(false, '', '');
            Projects.clear();
            ProvDrafts.clear();
            P2.clear();
            $state.transitionTo('home');
        }]);
