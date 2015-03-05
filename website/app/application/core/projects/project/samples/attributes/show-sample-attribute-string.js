Application.Directives.directive("showSampleAttributeString", showSampleAttributeStringDirective);
function showSampleAttributeStringDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "showSampleAttributeStringDirectiveController",
        templateUrl: "application/core/projects/project/samples/attributes/show-sample-attribute-string.html"
    };
}

Application.Controllers.controller("showSampleAttributeStringDirectiveController",
                                   ["$scope", "pubsub",
                                    showSampleAttributeStringDirectiveController]);
function showSampleAttributeStringDirectiveController($scope, pubsub) {
    $scope.control = {
        edit: $scope.edit
    };

    $scope.done = function() {
        $scope.control.edit = false;
        $scope.attribute.done = true;
        pubsub.send("create.sample.attribute.done");
    };
}
