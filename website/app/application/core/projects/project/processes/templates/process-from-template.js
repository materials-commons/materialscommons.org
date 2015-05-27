Application.Directives.directive("processFromTemplate", processFromTemplateDirective);
function processFromTemplateDirective() {
    return {
        restrict: "E",
        scope: {
            template: "=template"
        },
        controller: "processFromTemplateDirectiveController",
        templateUrl: "application/core/projects/project/processes/templates/process-from-template.html"
    };
}

Application.Controllers.controller("processFromTemplateDirectiveController",
                                   ["$scope", "templates", "pubsub", "processCheck",
                                    processFromTemplateDirectiveController]);
function processFromTemplateDirectiveController($scope, templates, pubsub, processCheck) {
    var index = _.indexOf(templates, function(template) {
        return template.id == "sample";
    });

    $scope.status = {
        processOpen: true,
        processDone: false,
        sampleOpen: false,
        sampleDone: false
    };

    $scope.allRequiredDone = false;
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

    //$scope.updateName = function() {
        //network.nodes[1].label = $scope.name;
    //};

    pubsub.waitOn($scope, "create.sample.attribute.done", function() {
        $scope.allRequiredDone = processCheck.allRequiredDone($scope.sampleTemplate);
        if ($scope.allRequiredDone) {
            $scope.status.sampleDone = true;
        }
    });
}
