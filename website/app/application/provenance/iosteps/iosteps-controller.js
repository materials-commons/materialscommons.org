Application.Provenance.Controllers.controller('provenanceIOSteps',
    ["$scope", "mcapi", "ProvSteps", "ProvDrafts", "$state", "$stateParams", "$injector",
        function ($scope, mcapi, ProvSteps, ProvDrafts, $state, $stateParams, $injector) {

            $scope.saveDraft = function (form) {
                var $validationProvider = $injector.get('$validation');
                var check = $validationProvider.checkValid(form);
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
                if (stepName === "Files") {
                    $state.go('toolbar.projectspage.provenance.iosteps.files', {iostep: filesStepType});
                } else {
                    $state.go('toolbar.projectspage.provenance.iosteps.iostep', {iostep: stepName});
                }
            };

            $scope.showStep = function (stepName) {
                var attrib;
                if ($stateParams.iosteps === "inputs") {
                    attrib = "input_conditions";
                } else {
                    attrib = "output_conditions";
                }

                if (stepName === "Files") {
                    $scope.gotoStep(stepName);
                } else if (stepName in $scope.doc.attributes[attrib]) {
                    $scope.gotoStep(stepName);
                } else {
                    mcapi('/templates/name/%', stepName)
                        .success(function (data) {
                            data.model.added_properties = [];
                            $scope.doc.attributes[attrib][stepName] = data;
                            $scope.gotoStep(stepName);
                        }).jsonp();
                }
            };

            $scope.isActiveStep = function (stepName) {
                return $scope.activeStep === stepName;
            };

            $scope.nextStep = function (form) {
                var $validationProvider = $injector.get('$validation');
                var check = $validationProvider.checkValid(form);
                if (check === true) {
                    var i = _.indexOf($scope.steps, $scope.activeStep);
                    if (i < $scope.steps.length - 1) {
                        var next = i + 1;
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
                    $scope.doc.attributes.process.required_input_conditions.forEach(function (condition) {
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
                $scope.message = '';
                $scope.doc = ProvDrafts.current;
                console.log($scope.doc);
                $scope.steps = [];
                $scope.loadSteps();
                $scope.activeStep = $scope.steps[0];
                $scope.showStep($scope.activeStep);
            };

            $scope.init();
        }]);