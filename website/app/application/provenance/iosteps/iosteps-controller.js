Application.Provenance.Controllers.controller('provenanceIOSteps',
    ["$scope", "mcapi", "ProvSteps", "ProvDrafts", "$state", "$stateParams",
        function ($scope, mcapi, ProvSteps, ProvDrafts, $state, $stateParams) {

            $scope.gotoStep = function (stepName) {
                $scope.activeStep = stepName;
                $state.go('toolbar.projectspage.provenance.iosteps.iostep', {iostep: stepName});
            };

            $scope.showStepInputs = function (stepName) {
                if (stepName in $scope.doc.attributes.input_conditions) {
                    $scope.gotoStep(stepName);
                } else {
                    mcapi('/templates/name/%', stepName)
                        .success(function (data) {
                            data.model.added_properties = [];
                            $scope.doc.attributes.input_conditions[stepName] = data;
                            $scope.gotoStep(stepName);
                        }).jsonp();
                }
            };

            $scope.showStepOutputs = function (stepName) {
                if (stepName in $scope.doc.attributes.output_conditions) {
                    $scope.gotoStep(stepName);
                } else {
                    mcapi('/templates/name/%', stepName)
                        .success(function (data) {
                            data.model.added_properties = [];
                            $scope.doc.attributes.output_conditions[stepName] = data;
                            $scope.gotoStep(stepName);
                        }).jsonp();
                }
            };

            $scope.showStep = function (stepName) {
                if ($stateParams.iosteps === "inputs") {
                    $scope.showStepInputs(stepName);
                } else {
                    $scope.showStepOutputs(stepName);
                }
            };

            $scope.isActiveStep = function (stepName) {
                return $scope.activeStep === stepName;
            };

            $scope.nextStep = function () {
                var i = _.indexOf($scope.steps, $scope.activeStep);
                if (i < $scope.steps.length - 1) {
                    var next = i + 1;
                    $scope.showStep($scope.steps[next]);
                } else {
                    ProvSteps.setStepFinished($stateParams.iosteps);
                }
            };

            $scope.loadSteps = function () {
                if ($stateParams.iosteps === "inputs") {
                    $scope.stepsName = "Inputs";
                    $scope.doc.attributes.process.required_conditions.forEach(function (condition) {
                        $scope.steps.push(condition);
                    });

                    if ($scope.doc.attributes.process.required_input_files) {
                        $scope.steps.push("Files");
                    }
                } else {
                    $scope.stepsName = "Outputs";
                    $scope.doc.attributes.process.required_output_conditions.forEach(function (condition) {
                        $scope.steps.push(condition);
                    });

                    if ($scope.doc.attributes.process.required_output_files) {
                        $scope.steps.push("Files");
                    }
                }
            };

            $scope.init = function () {
                $scope.doc = ProvDrafts.current;
                $scope.steps = [];
                $scope.loadSteps();
                $scope.activeStep = $scope.steps[0];
                $scope.showStep($scope.activeStep);
            };

            $scope.init();
        }]);