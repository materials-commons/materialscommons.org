Application.Directives.directive('actionProvenance', actionProvenanceDirective);

function actionProvenanceDirective() {
    return {
        controller: "actionProvenanceController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-provenance.html"
    };
}

Application.Controllers.controller('actionProvenanceController',
                                   ["$scope", "model.templates", "User", "$filter",
                                    actionProjectProvenanceController]);

function actionProjectProvenanceController($scope, templates, User, $filter) {
    function init() {
        templates.getList().then(function(templates) {
            $scope.templates = $filter('byKey')(templates, 'template_type', 'process');
            // Set the category name for sorting purposes
            $scope.templates.forEach(function(template) {
                template.category = "Process - " + template.category;
            });
            // Add the preferred templates
            if (User.attr().preferences.templates.length !== 0) {
                User.attr().preferences.templates.forEach(function(t) {
                    var template = $filter('byKey')(templates, 'id', t.id);
                    var preferred;
                    if (template) {
                        preferred = angular.copy(template[0]);
                        preferred.category = "Preferred";
                        $scope.templates.push(preferred);
                    }
                });
            }
        });
    }

    init();
}
