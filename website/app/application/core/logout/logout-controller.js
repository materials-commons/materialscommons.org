Application.Controllers.controller('logout',
    ["$rootScope", "$state", "$cookieStore", "User", "Projects", "ProvDrafts",
        function ($rootScope, $state, $cookieStore, User,  Projects, ProvDrafts) {
            $rootScope.email_address = '';
            $cookieStore.remove('mcuser');
            User.setAuthenticated(false, '', '');
            Projects.clear();
            ProvDrafts.clear();
            $state.transitionTo('home');
        }]);