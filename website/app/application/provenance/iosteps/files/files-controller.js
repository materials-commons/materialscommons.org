Application.Provenance.Controllers.controller('provenanceIOStepsFiles',
    ["$scope", "ProvDrafts", "$stateParams", "pubsub", "Projects",
        function ($scope, ProvDrafts, $stateParams, pubsub, Projects) {
            $scope.removeFile = function (index) {
                $scope.files[index].selected = false;
                $scope.files.splice(index, 1);
            };

            $scope.indexOfFile = function (id) {
                for (var i = 0; i < $scope.files.length; i++) {
                    if ($scope.files[i].id == id) {
                        return i;
                    }
                }
                return -1;
            };

            function init() {
                if ($stateParams.iostep === "inputs") {
                    $scope.channel = 'provenance.inputs.files';
                    $scope.files = ProvDrafts.current.process.input_files;
                } else {
                    $scope.channel = 'provenance.outputs.files';
                    $scope.files = ProvDrafts.current.process.output_files;
                }
                Projects.resetSelectedFiles($scope.files, ProvDrafts.current.project_id);
                Projects.setChannel($scope.channel);
            }

            init();

            pubsub.waitOn($scope, $scope.channel, function (fileentry) {
                if (fileentry.selected) {
                    $scope.files.push(fileentry);
                } else {
                    var i = $scope.indexOfFile(fileentry.id);
                    if (i != -1) {
                        $scope.files.splice(i, 1);
                    }
                }
            });
        }]);