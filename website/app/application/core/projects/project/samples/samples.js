Application.Controllers.controller("projectSamples",
                                   ["$scope", "templates", "pubsub",
                                    projectSamples]);
function projectSamples($scope, templates, pubsub) {
    $scope.network = {};
    $scope.templates = templates;
    pubsub.waitOn($scope, "process.network", function(network) {
        $scope.network = network;
    });
}
