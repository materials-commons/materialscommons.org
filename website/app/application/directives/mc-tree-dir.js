Application.Directives.directive('mcTreeDir', ["RecursionHelper", mcTreeDirDirective]);

function mcTreeDirDirective(RecursionHelper) {
    return {
        restrict: "E",
        scope: {
            item: '=item'
        },
        controller: "mcTreeDirDirectiveController",
        replace: true,
        templateUrl: 'application/directives/mc-tree-dir.html',
        compile: function(element) {
            return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn) {
            });
        }
    };
}

Application.Controllers.controller("mcTreeDirDirectiveController",
                                   ["$scope", mcTreeDirDirectiveController]);
function mcTreeDirDirectiveController($scope) {
    $scope.items = $scope.item.children;
}
