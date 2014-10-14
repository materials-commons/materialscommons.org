Application.Directives.directive("sidebar", sidebarDirective);

function sidebarDirective() {
    return {
        scope: true,
        restrict: "AE",
        replace: true,
        templateUrl: "sidebar.html",
        controller: "sidebarDirectiveController"
    };
}

Application.Controllers.controller("sidebarDirectiveController",
                                   ["$scope", "model.projects", "recent",
                                    sidebarDirectiveController]);

function sidebarDirectiveController($scope, projects, recent) {
    function computeProjectSizes(project) {
        var totalFiles = 0;
        $scope.project.projectSize = bytesToSizeStr(project.size);
        for (var key in project.mediatypes) {
            totalFiles += project.mediatypes[key];
        }
        $scope.project.fileCount = numberWithCommas(totalFiles);
    }

    $scope.showProjects = false;
    $scope.showAllRecent = false;
    $scope.showProjectActions = true;

    projects.getList().then(function(p) {
        $scope.projects = p;
        $scope.project = $scope.projects[0];
        computeProjectSizes($scope.project);
        $scope.recents = recent.getAll($scope.project.id);
    });

    $scope.recentIcon = function(itemType) {
        return recent.icon(itemType);
    };

    $scope.setProject = function(project) {
        $scope.project = project;
        $scope.showProjects = false;
        if (!('fileCount' in $scope.project)) {
            computeProjectSizes(project);
        }
    };
}
