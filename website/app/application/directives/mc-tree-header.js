Application.Directives.directive('mcTreeHeader', [mcTreeHeaderDirective]);

function mcTreeHeaderDirective() {
    return {
        restrict: "E",
        scope: {
            item: '=item',
            showSideboard: "=showSideboard"
        },
        controller: "mcTreeHeaderDirectiveController",
        replace: true,
        templateUrl: 'application/directives/mc-tree-header.html'
    };
}

Application.Controllers.controller("mcTreeHeaderDirectiveController",
                                   ["$scope", "mcfile", "sideboard", "current", mcTreeHeaderDirectiveController]);
function mcTreeHeaderDirectiveController($scope, mcfile, sideboard, current) {
    if ($scope.item.type === "datadir") {
        $scope.tooltip = "Upload to directory";
        $scope.faClass = "fa-upload";
    } else {
        $scope.tooltip = "Download file";
        $scope.faClass = "fa-download";
    }

    $scope.downloadSrc = function(file) {
        return mcfile.downloadSrc(file.id);
    };

    $scope.addToSideboard = function(file, event) {
        sideboard.handleFromEvent(current.projectID(), file, event, 'sideboard');
    };

}
