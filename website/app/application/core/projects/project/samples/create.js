Application.Controllers.controller("projectSamplesCreate",
                                   ["$scope", "templates", "pubsub",
                                    projectSamplesCreate]);
function projectSamplesCreate($scope, templates, pubsub) {
    var index = _.indexOf(templates, function(template) {
        return template.id == "sample";
    });

    $scope.sampleTemplate = templates[index];

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

    $scope.updateName = function() {
        network.nodes[1].label = $scope.name;
    };
}
