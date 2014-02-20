Application.Provenance.Controllers.controller('provenanceIOStepsFiles',
    ["$scope", "ProvDrafts", "$stateParams",
        function ($scope, ProvDrafts, $stateParams) {
            $scope.addFiles = function () {

            };

            $scope.removeFile = function(index) {

            };

            $scope.init = function () {
                $scope.showDetails = true;
                if ($stateParams.iostep === "inputs") {
                    $scope.files = ProvDrafts.current.attributes.process.required_input_files;
                } else {
                    $scope.files = ProvDrafts.current.attributes.process.required_output_files;
                }
            };

            $scope.init();
        }]);