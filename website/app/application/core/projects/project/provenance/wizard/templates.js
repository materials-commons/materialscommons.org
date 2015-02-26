Application.Controllers.controller("chooseTemplateController",
                                   ["$scope", "$timeout", "templates", chooseTemplateController]);

function chooseTemplateController($scope, $timeout, templates) {
    console.dir(templates[0]);
    $scope.matchingTemplates = templates;
    $scope.searchInput = {
        name: ""
    };
}
