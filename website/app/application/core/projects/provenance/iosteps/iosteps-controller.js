Application.Provenance.Controllers.controller('provenanceIOSteps',
    ["$scope", "mcapi", "ProvSteps", "ProvDrafts", "$state", "$stateParams", "$injector",
        function ($scope, mcapi, ProvSteps, ProvDrafts, $state, $stateParams, $injector) {
            var $validationProvider = $injector.get('$validation'), check;

            $scope.saveDraft = function (form) {
                check = $validationProvider.checkValid(form);
                if (check === true) {
                    ProvDrafts.saveDraft();
                    $scope.message = "your draft has been saved!";
                } else {
                    $validationProvider.validate(form);
                }
            };

            $scope.gotoStep = function (stepName) {
                var filesStepType = $stateParams.iosteps;
                $scope.activeStep = stepName;
                if (stepName.name === "Files") {
                    $state.go('projects.provenance.iosteps.files', {iostep: filesStepType});
                } else {
                    $state.go('projects.provenance.iosteps.iostep', {stepname: stepName.name, stepvalue: stepName.value});
                }
            };

            $scope.showStep = function (stepName) {
                var attrib;
                if ($stateParams.iosteps === "inputs") {
                    attrib = "input_conditions";
                } else {
                    attrib = "output_conditions";
                }

                if (stepName.name === "Files") {
                    $scope.gotoStep(stepName);
                } else if (stepName.value in $scope.doc.process[attrib]) {
                    $scope.gotoStep(stepName);
                } else {
                    mcapi('/templates/%', stepName.value)
                        .success(function (data) {
                            data.added_properties = [];
                            $scope.doc.process[attrib][stepName.value] = data;
                            $scope.gotoStep(stepName);
                        }).jsonp();
                }
            };

            $scope.isActiveStep = function (stepName) {
                return $scope.activeStep === stepName;
            };

            $scope.nextStep = function (form) {
                check = $validationProvider.checkValid(form);
                var i, next;
                if (check === true) {
                    i = _.indexOf($scope.steps, $scope.activeStep);
                    if (i < $scope.steps.length - 1) {
                        next = i + 1;
                        $scope.showStep($scope.steps[next]);
                    } else {
                        ProvSteps.setStepFinished($stateParams.iosteps);
                    }
                } else {
                    $validationProvider.validate(form);
                }
            };

            $scope.loadSteps = function () {
                if ($stateParams.iosteps === "inputs") {
                    $scope.stepsName = "Inputs";
                    $scope.doc.process.required_input_conditions.forEach(function (condition) {
                        $scope.steps.push(condition);
                    });
                    if ($scope.doc.process.required_input_files === true) {
                        $scope.steps.push({"name": "Files", "value": "files"});
                    }
                } else {
                    $scope.stepsName = "Outputs";
                    $scope.doc.process.required_output_conditions.forEach(function (condition) {
                        $scope.steps.push(condition);
                    });

                    if ($scope.doc.process.required_output_files === true) {
                        $scope.steps.push({"name": "Files", "value": "files"});
                    }
                }
            };

            $scope.init = function () {
                $scope.message = '';
                $scope.doc = ProvDrafts.current;
                $scope.steps = [];
                $scope.loadSteps();
                $scope.activeStep = $scope.steps[0];
                $scope.showStep($scope.activeStep);
            };

            $scope.init();
        }]);
