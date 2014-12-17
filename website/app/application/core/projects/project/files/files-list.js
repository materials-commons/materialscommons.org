Application.Directives.directive("filesList", filesListDirective);
function filesListDirective() {
    return {
        restrict: "AE",
        replace: true,
        controller: "filesListDirectiveController",
        templateUrl: "application/core/projects/project/files/files-list.html"
    };
}

Application.Controllers.controller("filesListDirectiveController",
                                   ["$scope", "$debounce", "watcher",
                                    filesListDirectiveController]);
function filesListDirectiveController($scope, $debounce, watcher) {
    $scope.search = {
        fullname: ""
    };

    watcher.watch($scope, "searchInput", function(value) {
        if ($scope.search.fullname == value) {
            return;
        }
        $debounce(applyQuery, 350);
    });

    function applyQuery() {
        $scope.search.fullname = $scope.searchInput;
    }
}
