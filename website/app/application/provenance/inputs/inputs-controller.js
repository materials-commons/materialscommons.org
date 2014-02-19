Application.Provenance.Controllers.controller('provenanceInputs',
    ["$scope", "mcapi", "ProvSteps", "ProvDrafts", "$state",
        function ($scope, mcapi, ProvSteps, ProvDrafts, $state) {

            $scope.gotoStep = function (stepName) {
                $scope.activeStep = stepName;
                $state.go('toolbar.projectspage.provenance.inputs.input', {step: stepName});
            };

            $scope.showStep = function (stepName) {
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

            $scope.isActiveStep = function (stepName) {
                return $scope.activeStep === stepName;
            };

            $scope.nextStep = function () {
                var i = _.indexOf($scope.inputSteps, $scope.activeStep);
                if (i < $scope.inputSteps.length - 1) {
                    var next = i + 1;
                    $scope.showStep($scope.inputSteps[next]);
                } else {
                    ProvSteps.setStepFinished('inputs');
                }
            };

            $scope.init = function () {
                $scope.doc = ProvDrafts.current;
                $scope.inputSteps = [];
                $scope.doc.attributes.process.required_conditions.forEach(function (condition) {
                    $scope.inputSteps.push(condition);
                });

                if ($scope.doc.attributes.process.required_input_files) {
                    $scope.inputSteps.push("Files");
                }

                $scope.activeStep = $scope.inputSteps[0];
                $scope.showStep($scope.activeStep);
            };

            $scope.init();
        }]);