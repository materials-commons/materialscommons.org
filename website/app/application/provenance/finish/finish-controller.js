Application.Provenance.Controllers.controller('provenanceFinish',
    ["$scope", "ProvDrafts", "$dialog", "$state", "mcapi", "alertService", "$stateParams",
        function ($scope, ProvDrafts, $dialog, $state, mcapi, alertService, $stateParams) {

            $scope.saveDraft = function () {
                ProvDrafts.saveDraft();
                $state.go("toolbar.projectspage.overview", {id: $stateParams.id});
            };

            $scope.submitProvenance = function () {
                var title = '',
                    msg = 'Once you submit provenance you cannot change it. Do you wish to submit?',
                    buttons = [
                        {result: "no", label: "No"},
                        {result: "yes", label: "Yes"}
                    ];
                $dialog.messageBox(title, msg, buttons)
                    .open()
                    .then(function (result) {
                        if (result === "no") {
                            return;
                        }
                        ProvDrafts.saveDraft(function () {
                            mcapi('/upload')
                                .success(function (data) {
                                    $scope.done = true;
                                    $scope.process_id = data.process;
                                    ProvDrafts.deleteDraft($scope.doc.id);
                                    alertService.sendMessage("Your Provenance was Created Successfully.");
                                    $state.go("toolbar.projectspage.overview", {id: $stateParams.id});
                                })
                                .error(function () {
                                    $scope.notdone = true;
                                    alertService.sendMessage("Sorry - Your Provenance upload failed.");
                                })
                                .post({state_id: $scope.doc.id});

                        });
                    });
            };

            $scope.deleteDraft = function () {
                ProvDrafts.deleteRemoteDraft($scope.doc.id);
                $state.go("toolbar.projectspage.overview", {id: $stateParams.id});
            };

            $scope.init = function () {
                $scope.doc = ProvDrafts.current;
                $scope.process = $scope.doc.attributes.process;
                $scope.inputs = $scope.doc.attributes.input_conditions;
                $scope.outputs = $scope.doc.attributes.output_conditions;
                $scope.input_files = $scope.doc.attributes.input_files;
                $scope.output_files = $scope.doc.attributes.output_files;
            };

            $scope.init();
        }]);