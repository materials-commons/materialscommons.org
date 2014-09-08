Application.Directives.directive('actionCreateProvenance', actionCreateProvenanceDirective);

function actionCreateProvenanceDirective() {
    return {
        controller: "actionCreateProvenanceController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-create-provenance.html"
    };
}

Application.Controllers.controller('actionCreateProvenanceController',
                                   ["$scope", "model.templates", "User", "$filter",
                                    actionCreateProvenanceController]);

function actionCreateProvenanceController($scope, templates, User, $filter) {
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
