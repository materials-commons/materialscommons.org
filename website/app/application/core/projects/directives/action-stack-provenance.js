Application.Directives.directive('actionProvenance', actionProvenanceDirective);

function actionProvenanceDirective() {
    return {
        controller: "actionProvenanceController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-provenance.html"
    };
}

Application.Controllers.controller('actionProvenanceController',
                                   ["$scope", "watcher", "mcapi", "$filter", "User", "ProvDrafts",
                                    actionProjectProvenanceController]);

function actionProjectProvenanceController($scope, watcher, mcapi, $filter, User, ProvDrafts) {

    watcher.watch($scope, 'numberOfSteps', function(value){
        $scope.stepsToShow = $scope.steps.slice(0, value);
    });

    function findTemplate(templateID) {
        var i = _.indexOf($scope.process_templates, function(t) {
            return t.id == templateID;
        });

        return $scope.process_templates[i];
    }

    $scope.change_process = function (templateID) {
        $scope.doc.template = findTemplate(templateID);
        console.dir($scope.doc.template);
    };

    function makeName(name) {
        if (name.length > 20) {
            return name.slice(0,17) + "...";
        }
        return name;
    }

    function init() {
        $scope.steps = ["(I) Settings", "(I) Sample", "(I) Files", "(O) Sample", "(O) Files", "Done"];
        $scope.stepsToShow = [];

        ProvDrafts.current = ProvDrafts.newDraft();
        $scope.doc = ProvDrafts.current;
        $scope.doc.template = "";

        mcapi('/templates')
            .argWithValue('filter_by', '"template_type":"process"')
            .argWithValue('order_by', 'template_name')
            .success(function (templates) {
                $scope.process_templates = templates;
                $scope.experimental_templates = $filter('templateFilter')($scope.process_templates, 'experiment');
                $scope.computational_templates = $filter('templateFilter')($scope.process_templates, 'computation');

            })
            .error(function () {
                alertService.sendMessage("Unable to retrieve processes from database.");
            }).jsonp();

        mcapi('/user/%/preferred_templates', User.u())
            .success(function (data) {
                $scope.preferred_templates = data.preferences.templates;
            }).jsonp();
    }

    init();
}
