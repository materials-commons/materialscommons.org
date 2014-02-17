Application.Controllers.controller('logout',
    ["$rootScope", "$state", "$cookieStore", "User", "Stater", "Thumbnails", "Projects",
        function ($rootScope, $state, $cookieStore, User, Stater, Thumbnails, Projects) {
            Stater.clear();
            $rootScope.email_address = '';
            User.setAuthenticated(false, '', '');
            $state.transitionTo('home')
            $cookieStore.remove('mcuser');
            Thumbnails.clear();
            Projects.clear();
        }]);