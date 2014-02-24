Application.Provenance.Controllers.controller('provenanceFinish',
    ["$scope", "ProvDrafts", "$dialog", "$state",
        function ($scope, ProvDrafts, $dialog, $state) {

            $scope.saveDraft = function () {
                ProvDrafts.saveDraft();
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
                            console.log("Not submitting");
                            return;
                        }
                        console.log("Submitting provenance");
                    });
            };

            $scope.deleteDraft = function () {
                ProvDrafts.deleteRemoteDraft($scope.doc.id);
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