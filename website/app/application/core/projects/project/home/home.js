Application.Controllers.controller('projectHome',
                                   ["$scope", "project", "User", "mcapi", "ui", projectHome]);

function projectHome($scope, project, User, mcapi, ui) {

    function userShow(what) {
        switch(what) {
        case "samples":
            return $scope.showSamples;
        case "reviews":
            return $scope.showReviews;
        case "notes":
            return $scope.showNotes;
        case "processes":
            return $scope.showProcesses;
        case "files":
            return $scope.showFiles;
        default:
            return false;
        }
    }

    $scope.show = function(what) {
        // If user is not showing this item then return false
        var isUserShowing = userShow(what);
        if (!isUserShowing) {
            return false;
        }

        // Otherwise check status.
        var expanded = ui.anyExpandedExcept(project.id, what);
        // if expanded is true that means something is expanded
        // besides the requested entry, so return false to show
        // this entry. Otherwise if expanded is false, that means
        // nothing is expanded so return true.
        return !expanded;
    };

    $scope.isExpandedInColumn = function(what) {
        var anyExpanded = false;
        what.forEach(function(entry) {
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

    $scope.showCalendar = false;
    $scope.showSideboard = false;
    $scope.showReviews = true;
    $scope.showSamples = true;
    $scope.showFiles = true;
    $scope.showNotes = true;
    $scope.showProcesses = true;
}
