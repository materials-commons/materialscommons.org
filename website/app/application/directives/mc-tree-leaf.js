Application.Directives.directive('mcTreeLeaf', mcTreeLeafDirective);

function mcTreeLeafDirective() {
    return {
        restrict: "E",
        scope: {
            item: '=item'
        },
        controller: "mcTreeLeafDirectiveController",
        replace: true,
        templateUrl: 'application/directives/mc-tree-leaf.html'
    };
}

Application.Controllers.controller("mcTreeLeafDirectiveController",
                                   ["$scope", "User", "mcfile",
                                    mcTreeLeafDirectiveController]);
function mcTreeLeafDirectiveController($scope, User, mcfile) {
    $scope.apikey = User.apikey();

    $scope.fileSrc = function(file) {
        return mcfile.src(file.id);
    };

    if (isImage($scope.item.mediatype)) {
        $scope.fileType = "image";
    } else if ($scope.item.mediatype === "application/pdf") {
        $scope.fileType = "pdf";
    } else {
        $scope.fileType = $scope.item.mediatype;
    }
}
