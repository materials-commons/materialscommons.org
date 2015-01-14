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
                                   ["$scope", "pubsub", "toggleDragButton", mcTreeDirDirectiveController]);
function mcTreeDirDirectiveController($scope,pubsub, toggleDragButton) {
    $scope.items = $scope.item.children;
    $scope.bk = {
        addToReview: false,
        addToProvenance: false,
        addToSample: false ,
        addToNote: false
    };

    $scope.isActive = function(type, button){
        return toggleDragButton.get(type, button);
    };

    $scope.addItem = function (type, file) {
        switch (type) {
            case "review":
                pubsub.send('addFileToReview', file);
                break;
            case "sample":
                pubsub.send('addFileToSample', file);
                break;
            case "provenance":
                pubsub.send('addFileToProvenance', file);
                break;
            case "file":
                pubsub.send('addFileToNote', file);
                break;
        }
    };

}
