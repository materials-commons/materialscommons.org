Application.Controllers.controller('projectHome',
    ["$scope", "project", "User", "mcapi", "ui", "homeCustomize", projectHome]);

function projectHome($scope, project, User, mcapi, ui, homeCustomize) {

    $scope.show = function (what) {
        var expanded = ui.anyExpandedExcept(project.id, what);
        var result =  homeCustomize.showPanel(what);
        if (result === true){
            return !expanded;
        }else{
            return result;
        }
    };

    $scope.isExpandedInColumn = function (what) {
        var anyExpanded = false;
        what.forEach(function (entry) {
            if (ui.isExpanded(project.id, entry)) {
                anyExpanded = true;
            }
        });
        return anyExpanded;
    };

    $scope.updateName = function () {
        mcapi('/users/%', $scope.mcuser.email)
            .success(function (u) {
                $scope.editFullName = false;
                User.save($scope.mcuser);
            }).put({fullname: $scope.mcuser.fullname});
    };

    $scope.project = project;
    $scope.mcuser = User.attr();
}
