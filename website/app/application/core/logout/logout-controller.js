Application.Controllers.controller('logout',
    ["$rootScope", "$state", "$window", "User", "projectFiles", "model.projects",
        function ($rootScope, $state, $window, User, projectFiles, projects) {
            $rootScope.email_address = '';
            $window.sessionStorage.removeItem('mcuser');
            User.setAuthenticated(false, '', '');
            projectFiles.clear();
            projects.clear();
            $state.transitionTo('home');
        }]);
