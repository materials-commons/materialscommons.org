Application.Provenance.Controllers.controller('provenanceFinish',
    ["$scope", "ProvDrafts", "$state", "mcapi", "alertService", "$stateParams",
        function ($scope, ProvDrafts, $state, mcapi, alertService, $stateParams) {

            $scope.saveDraft = function () {
                ProvDrafts.saveDraft();
                alertService.sendMessage("Your draft has been saved!");
            };

            $scope.deleteDraft = function () {
                ProvDrafts.deleteRemoteDraft($scope.doc.id);
                $state.go("toolbar.projectspage.overview", {id: $stateParams.id});
            };

            $scope.submitProvenance = function () {
                ProvDrafts.saveDraft(function () {
                    mcapi('/provenance')
                        .success(function (data) {
                            $scope.done = true;
                            $scope.process_id = data.process;
                            ProvDrafts.deleteDraft($scope.doc.id);
                            alertService.sendMessage("Your Provenance was Created Successfully.");
                            ProvDrafts.current = null;
                            $state.go("toolbar.projectspage.overview", {'id': $scope.doc.project_id});
                        })
                        .error(function () {
                            $scope.title = "Validation Error:";
                            $scope.message = "One of your steps is not complete. Please verify and submit again";
                            $scope.notdone = true;
                        }).post({draft_id: $scope.doc.id});

                });
            };

            $scope.cancel = function () {
                return;
            };

            $scope.init = function () {
                $scope.message = "Once you submit the provenance you cannot change it. Do you wish to submit?";
                $scope.title = "Confirmation Step";
                $scope.doc = ProvDrafts.current;
                $scope.process = $scope.doc.process;
                $scope.inputs = $scope.doc.process.input_conditions;
                $scope.outputs = $scope.doc.process.output_conditions;
                $scope.input_files = $scope.doc.process.input_files;
                $scope.output_files = $scope.doc.process.output_files;
                mcapi('/machines')
                    .success(function (data) {
                        $scope.machines_list = data;
                    }).jsonp();
            };

            $scope.init();
        }]);
