Application.Directives.directive("displayTags", displayTagsDirective);

function displayTagsDirective() {
    return {
        scope: {
            tags: "="
        },
        controller: "displayTagsDirectiveController",
        restrict: "AE",
        templateUrl: "application/directives/display-tags.html"
    };
}

Application.Controllers.controller("displayTags", ["$scope", displayTagsDirectiveController]);

function displayTagsDirectiveController($scope) {
    $scope.tooltip = function(tag) {
        if (tag.description && tag.description !== "") {
            return tag.name + ": " + tag.description;
        }
        return tag.name;
    };
}
