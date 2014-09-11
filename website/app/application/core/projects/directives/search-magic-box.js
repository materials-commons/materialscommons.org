Application.Directives.directive('searchMagicBox', searchMagicBoxDirective);

function searchMagicBoxDirective() {
    return {
        scope: {},
        controller: "searchMagicBoxController",
        restrict: "AE",
        templateUrl: "application/core/projects/directives/search-magic-box.html"
    };
}

Application.Controllers.controller('searchMagicBoxController',
                                   ["$scope", "$stateParams", "model.projects",
                                    "pubsub", searchMagicBoxController]);

function searchMagicBoxController($scope, $stateParams, projects , pubsub) {
}
