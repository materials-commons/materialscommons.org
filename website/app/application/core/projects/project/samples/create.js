Application.Controllers.controller("projectSamplesCreate",
                                   ["$scope", "templates", "pubsub", "processCheck",
                                    projectSamplesCreate]);
function projectSamplesCreate($scope, templates, pubsub) {
    // Eventually move this code out of the controller and
    // instead inject the template we are using.
    var index = _.indexOf(templates, function(template) {
        return template.id === "as_received";
    });

    $scope.allRequiredDone = false;
    $scope.template = angular.copy(templates[index]);

    var network = {
        nodes: [
            {id: 1, label: "as_received", level: 0, group: "process"},
            {id: 2, label: "new sample", level: 1, group: "sample"}
        ],
        edges: [
            {id: 1, from: 1, to: 2}
        ]
    };
    pubsub.send("process.network", network);
}
