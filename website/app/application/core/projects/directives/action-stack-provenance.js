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

    $scope.change_process = function (template_id) {
        if ($scope.doc.template.id === template_id) {
            // All attributes already loaded from a draft
            return;
        }
        mcapi('/templates/%', template_id)
            .success(function (data) {
                $scope.template =  data;
                $scope.doc.default_properties = $scope.template.default_properties;
                $scope.doc.required_input_conditions = $scope.template.required_input_conditions;
                $scope.doc.required_output_conditions = $scope.template.required_output_conditions;
                $scope.doc.required_input_files = $scope.template.required_input_files;
                $scope.doc.required_output_files = $scope.template.required_output_files;
                var now = new Date();
                var dd = ("0" + now.getDate()).slice(-2);
                var mm = ("0" + (now.getMonth() + 1)).slice(-2);
                var today = now.getFullYear() + "-" + mm + "-" + dd;
                $scope.doc.name = $scope.template.template_name + ':' + today;
                $scope.doc.template = $scope.template;
                $scope.doc.owner = User.u();
                console.dir($scope.doc);
                $scope.stepsToShow = [];

                var i;
                for (i = 0; i < $scope.doc.template.required_input_conditions.length; i++) {
                    $scope.stepsToShow.push("(I) " +
                                            makeName($scope.doc.template.required_input_conditions[i].name));
                }

                if ($scope.doc.template.required_input_files) {
                    $scope.stepsToShow.push("(I) Files");
                }

                for (i = 0; i < $scope.doc.template.required_output_conditions.length; i++) {
                    $scope.stepsToShow.push("(O) " +
                                            makeName($scope.doc.template.required_output_conditions[i].name));
                }

                if ($scope.doc.template.required_output_files) {
                    $scope.stepsToShow.push("(O) Files");
                }
            }).jsonp();

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
