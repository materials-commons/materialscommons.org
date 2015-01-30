Application.Controllers.controller('logout',
    ["$rootScope", "$state", "$window", "User", "projectFiles", "ProvDrafts", "model.projects",
        function ($rootScope, $state, $window, User, projectFiles, ProvDrafts, projects) {
            $rootScope.email_address = '';
            $window.sessionStorage.removeItem('mcuser');
            User.setAuthenticated(false, '', '');
            projectFiles.clear();
            //ProvDrafts.clear();
            projects.clear();
            $state.transitionTo('home');
        }]);
