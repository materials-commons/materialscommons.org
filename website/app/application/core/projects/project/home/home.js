Application.Controllers.controller('projectHome',
    ["$scope", "project", "User", "mcapi", "ui", projectHome]);

function projectHome($scope, project, User, mcapi, ui) {

    $scope.show = function (what) {
        var expanded = ui.anyExpandedExcept(project.id, what);
        var result = ui.showPanel(what, project.id);
        if (!result) {
            // If user is not showing this item then return false
            return result;
        } else {
            // if expanded is true that means something is expanded
            // besides the requested entry, so return false to show
            // this entry. Otherwise if expanded is false, that means
            // nothing is expanded so return true.
            return !expanded;
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

    $scope.isColumnActive = function(column){
        return ui.getColumn(column,  $scope.project.id);
    };

    $scope.isEmptySplitBoard = function(){
        return ui.getEmptySplitBoardStatus($scope.project.id);
    };

    $scope.project = project;
    $scope.mcuser = User.attr();

}
