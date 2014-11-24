Application.Directives.directive("quickbar", quickbarDirective);

function quickbarDirective() {
    return {
        scope: true,
        restrict: "AE",
        replace: true,
        templateUrl: "index/quickbar.html",
        controller: "quickbarDirectiveController"
    };
}

Application.Controllers.controller("quickbarDirectiveController",
    ["$scope", "User", "$state", "projectState", "current",
        quickbarDirectiveController]);

function quickbarDirectiveController($scope, User, $state, projectState, current) {

    $scope.isAuthenticated = function () {
        return User.isAuthenticated();
    };

    $scope.create = function (type) {
        var state = null;
        var project = current.project();
        var stateID = projectState.add(project.id, state);
        switch (type) {
            case "provenance":
                $state.go("projects.project.provenance.create", {sid: stateID});
                break;
            case "review":
                $state.go("projects.project.reviews.create", {sid: stateID});
                break;
            case "note":
                $state.go("projects.project.notes.create", {sid: stateID});
                break;
            case "sample":
                $state.go("projects.project.samples.create", {sid: stateID});
                break;
            case "task":
                $state.go("projects.project.tasks.create", {sid: stateID});
                break;
            case "tag":
                $state.go("projects.project.tags.create", {sid: stateID});
                break;
            default:
                break;
        }
    };
}
