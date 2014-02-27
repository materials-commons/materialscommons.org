Application.Controllers.controller('logout',
    ["$rootScope", "$state", "$cookieStore", "User", "Stater", "Thumbnails", "Projects", "ProvDrafts",
        function ($rootScope, $state, $cookieStore, User, Stater, Thumbnails, Projects, ProvDrafts) {
            $rootScope.email_address = '';
            $cookieStore.remove('mcuser');
            User.setAuthenticated(false, '', '');
            Thumbnails.clear();
            Projects.clear();
            ProvDrafts.clear();
            $state.transitionTo('home');
        }]);