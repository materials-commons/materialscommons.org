Application.Controllers.controller('logout',
    ["$rootScope", "$state", "$cookieStore", "User", "projectFiles", "ProvDrafts", "model.projects",
        function ($rootScope, $state, $cookieStore, User, projectFiles, ProvDrafts, projects) {
            $rootScope.email_address = '';
            $cookieStore.remove('mcuser');
            User.setAuthenticated(false, '', '');
            projectFiles.clear();
            //ProvDrafts.clear();
            projects.clear();
            $state.transitionTo('home');
        }]);
