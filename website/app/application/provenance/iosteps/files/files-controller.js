Application.Provenance.Controllers.controller('provenanceIOStepsFiles',
    ["$scope", "ProvDrafts", "$stateParams", "pubsub", "Projects",
        function ($scope, ProvDrafts, $stateParams, pubsub, Projects) {

            $scope.init = function () {
                if ($stateParams.iostep === "inputs") {
                    $scope.channel = 'provenance.inputs.files';
                    $scope.files = ProvDrafts.current.attributes.input_files;
                } else {
                    $scope.channel = 'provenance.outputs.files';
                    $scope.files = ProvDrafts.current.attributes.output_files;
                }
                Projects.setChannel($scope.channel);
            };

            $scope.init();

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
        }]);