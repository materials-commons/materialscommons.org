Application.Controllers.controller('_projectsAction', ["$scope", "pubsub", _projectsAction]);

function _projectsAction($scope, pubsub) {
    pubsub.waitOn($scope, "active-action", function(action) {
        $scope.activeActionArea = action;
    });

    $scope.closeActionArea = function() {
        $scope.activeActionArea = "closed";
        pubsub.send("active-action-close", "closed");
    };

    function init() {
        $scope.activeActionArea = "closed";
    }

    init();
}
