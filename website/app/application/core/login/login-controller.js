Application.Controllers.controller('login',
    ["$scope", "$state", "User", "toastr",
        "mcapi", "Nav", "pubsub", "model.projects",
        "projectFiles", "$anchorScroll", "$location", loginController]);
function loginController($scope, $state, User, toastr, mcapi, Nav, pubsub, projects, projectFiles, $anchorScroll, $location) {
    $scope.login = function () {
        mcapi('/user/%/apikey', $scope.email, $scope.password)
            .success(function (u) {
                User.setAuthenticated(true, u);
                pubsub.send("tags.change");
                Nav.setActiveNav('home');
                projects.clear();
                projectFiles.clear();
                projects.getList().then(function (projects) {
                    if (projects.length === 0) {
                        $state.go("projects.create");
                    } else {
                        $state.go('projects.project.home', {id: projects[0].id});
                    }
                });
            })
            .error(function (reason) {
                $scope.message = "Incorrect Password/Username!"
                toastr.error(reason.error, 'Error', {
                    closeButton: true
                });
            }).put({password: $scope.password});
    };

    $scope.cancel = function () {
        $state.transitionTo('home');
    };

    $scope.goTo = function (id) {
        // set the location.hash to the id of
        // the element you wish to scroll to.
        $location.hash(id);
        // call $anchorScroll()
        $anchorScroll();
    };
}
