Application.Controllers.controller("chooseTemplateController",
                                   ["$scope", "$timeout", "templates", chooseTemplateController]);

function chooseTemplateController($scope, $timeout, templates) {
    $scope.matchingTemplates = templates;
    $scope.searchInput = {
        name: ""
    };
    templates.forEach(function(template) {
        template.showDetails = false;
    });
}
